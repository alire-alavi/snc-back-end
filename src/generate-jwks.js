import { pem2jwk } from "pem-jwk";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";


const publicKey = fs.readFileSync("public.pem", "utf8");
const jwkKey = pem2jwk(publicKey);

const keyId = uuidv4(); // Unique identifier for the key

const jwks = {
    keys: [
        {
            kty: jwkKey.kty,
            kid: keyId,
            use: "sig",
            alg: "RS256",
            n: jwkKey.n,
            e: jwkKey.e,
        },
    ],
};

fs.writeFileSync("src/jwks.file.js", JSON.stringify(jwks, null, 2));

console.log("JWKS generated successfully:", jwks);

