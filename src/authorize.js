import { stringify } from 'querystring';

const TELEGRAM_BOT_USERNAME = 'gamertag_app_bot';
const OIDC_ISSUER = process.env.OIDC_ISSUER;

/**
 * Generates the Telegram OAuth URL.
 */
export const handler = async (event) => {
  try {
    const { client_id, redirect_uri, state } =
      event.queryStringParameters || {};

    if (!client_id || !redirect_uri) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Construct the Telegram OAuth URL
    const telegramOAuthUrl = `https://oauth.telegram.org/auth?${stringify(
      {
        bot_id: TELEGRAM_BOT_USERNAME,
        origin: redirect_uri,
        return_to: `${OIDC_ISSUER}/token`,
        state: state || '',
      }
    )}`;

    return {
      statusCode: 302,
      headers: { Location: telegramOAuthUrl },
    };
  } catch (error) {
    console.error('Authorize error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
