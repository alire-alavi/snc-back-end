import { jwks } from './jwks.json';

export const jwks = async () => {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jwks),
    };
};

