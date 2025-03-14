import crypto from 'crypto';
import pkg from 'jsonwebtoken';
import { getSecretFromS3 } from './get-secret.js';
const { sign } =  pkg;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OIDC_ISSUER = process.env.OIDC_ISSUER;

/**
 * Verifies Telegram authentication data using hash validation.
 */
function verifyTelegramAuth(data) {
  const authData = { ...data };
  const receivedHash = authData.hash;
  delete authData.hash;

  const sortedKeys = Object.keys(authData).sort();
  const dataString = sortedKeys
    .map((key) => `${key}=${authData[key]}`)
    .join('\n');

  const secretKey = crypto
    .createHash('sha256')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');

  return expectedHash === receivedHash;
}

/**
 * Generates a JWT for the user.
 */
async function generateToken(user) {
  const payload = {
    sub: user.id.toString(), // User's Telegram ID as sub
    name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
    username: user.username || null,
    picture: user.photo_url || null,
    iss: OIDC_ISSUER,
    aud: 'aws-cognito',
    exp: Math.floor(Date.now() / 1000) + 3600, // 1-hour expiration
  };

  const { SECRET_S3_BUCKET } = process.env;
  console.log(SECRET_S3_BUCKET);
  const privateKey = await getSecretFromS3();

  return sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Lambda function handler for /token API.
 */
export const handler = async (event) => {
  try {
    const data = event.queryStringParameters;

    if (!verifyTelegramAuth(data)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid Telegram authentication' }),
      };
    }

    // Generate JWT token
    const token = generateToken(data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: token,
        id_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    };
  } catch (error) {
    console.error('Token generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
