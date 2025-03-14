import { jwt } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Decodes and verifies the JWT token from the request headers.
 */
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split(' ')[1];

  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

/**
 * Lambda function handler for /userinfo API.
 */
module.exports.userinfo = async (event) => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    const user = verifyToken(authHeader);

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
    console.error('Userinfo error:', error);
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
};
