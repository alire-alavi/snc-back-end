// const fs = require("fs");
// const jwk = require("jwk-to-pem");
// const { v4: uuidv4 } = require("uuid");
import { pem2jwk } from "pem-jwk";
import { v4 as uuidv4 } from 'uuid';
import fs from "fs";


const publicKey = fs.readFileSync("public.pem", "utf8");
const privateKey = fs.readFileSync("private.pem", "utf8");
const jwkKey = pem2jwk(publicKey);
// const jwkKey = jwk(publicKey, { use: "sig", alg: "RS256" });

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

fs.writeFileSync("src/jwks.json", JSON.stringify(jwks, null, 2));

console.log("JWKS generated successfully:", jwks);

