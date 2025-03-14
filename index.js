const AWS = require("aws-sdk");
const crypto = require("crypto");
const axios = require("axios");

module.exports.authorize = async (event) => {};
module.exports.jwks = async (event) => {};
module.exports.token = async (event) => {};


const { TELEGRAM_BOT_TOKEN, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_REGION } = process.env;
const cognito = new AWS.CognitoIdentityServiceProvider({ region: COGNITO_REGION });

function checkTelegramAuth(data) {
    const authData = { ...data };
    const checkHash = authData.hash;
    delete authData.hash;

    const sortedKeys = Object.keys(authData).sort();
    const dataString = sortedKeys.map((key) => `${key}=${authData[key]}`).join("\n");
    const secretKey = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
    const hash = crypto.createHmac("sha256", secretKey).update(dataString).digest("hex");

    return hash === checkHash;
}

async function getCognitoUser(telegramId) {
    try {
        const users = await cognito.listUsers({
            UserPoolId: COGNITO_USER_POOL_ID,
            Filter: `sub = "${telegramId}"`,
        }).promise();

        return users.Users.length > 0 ? users.Users[0] : null;
    } catch (error) {
        console.error("Error checking Cognito user:", error);
        return null;
    }
}

async function createCognitoUser(telegramId, username) {
    const params = {
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: telegramId,
        UserAttributes: [
            { Name: "sub", Value: telegramId },
            { Name: "preferred_username", Value: username },
        ],
        MessageAction: "SUPPRESS",
    };

    try {
        await cognito.adminCreateUser(params).promise();
        return telegramId;
    } catch (error) {
        console.error("Error creating Cognito user:", error);
        return null;
    }
}

async function authenticate(event) {
    try {
        const body = JSON.parse(event.body);

        if (!checkTelegramAuth(body)) {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid Telegram authentication" }) };
        }

        const telegramId = body.id.toString();
        const username = body.username || `user_${telegramId}`;

        let user = await getCognitoUser(telegramId);

        if (!user) {
            user = await createCognitoUser(telegramId, username);
        }

        const authParams = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: telegramId,
                PASSWORD: "SomeRandomPassword123!", // Consider a secure method for handling authentication
            },
        };

        const authResponse = await cognito.initiateAuth(authParams).promise();
        return { statusCode: 200, body: JSON.stringify(authResponse.AuthenticationResult) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}

module.exports = { authenticate };

