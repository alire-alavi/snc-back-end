import { jwkFile } from './jwks.file';

export const handler = async () => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jwkFile),
    };
};

