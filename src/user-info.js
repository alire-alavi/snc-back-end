import { jwt } from 'jsonwebtoken';
import { getPublicKeyFromS3 } from './get-secret';

/**
 * Verifies the JWT using RS256
 */
async function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];
    const publicKey = await getPublicKeyFromS3();

    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
}

/**
 * Lambda function handler for /userinfo API.
 */
export const handler = async (event) => {
    try {
        const authHeader = event.headers.Authorization || event.headers.authorization;
        const user = await verifyToken(authHeader);

        return {
            statusCode: 200,
            body: JSON.stringify({
                sub: user.sub,
                name: user.name,
                username: user.username,
                picture: user.picture,
                iss: user.iss,
                aud: user.aud,
            }),
        };
    } catch (error) {
        console.error("Userinfo error:", error);
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
};

