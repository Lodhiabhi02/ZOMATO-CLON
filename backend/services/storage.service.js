const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const path = require("path");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  region: process.env.AWS_REGION,
});

async function uploadFile(file, fileName) {
  try {
    const fileKey = `foods/${fileName}${path.extname(file.originalname)}`;
const uploadParams = {
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: fileKey,
  Body: file.buffer,
  ContentType: file.mimetype,
  // ACL: 'public-read', // ❌ remove this line
};


    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return { url: fileUrl };
  } catch (error) {
    console.error("❌ AWS upload error:", error);
    throw new Error("AWS upload failed");
  }
}

module.exports = { uploadFile };
