import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "me-central-1"});

const bucketName = process.env.SECRET_S3_BUCKET;

export async function getSecretFromS3() {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: 'private.pem',
    });
    const data = await s3.send(command);
    return data.Body.toString();
}

export async function getPublicKeyFromS3() {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: 'public.pem',
    });
    const data = await s3.send(command);
    return data.Body.toString();
}

