require("dotenv").config();
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Log AWS environment variables safely
console.log("🔍 Checking AWS S3 environment variables...\n");

console.log({
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || "❌ Missing",
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY ? "✅ Loaded" : "❌ Missing",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "❌ Missing",
  AWS_REGION: process.env.AWS_REGION || "❌ Missing",
});

// Validate required keys
if (
  !process.env.AWS_ACCESS_KEY ||
  !process.env.AWS_SECRET_KEY ||
  !process.env.AWS_BUCKET_NAME ||
  !process.env.AWS_REGION
) {
  console.error("\n⛔ ERROR: One or more AWS S3 credentials are missing in your .env file.");
  console.error("➡️ Fix your .env and try again.");
  process.exit(1);
}

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Test: List 5 objects from your bucket
console.log("\n🔄 Testing S3 access...\n");

async function testS3() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      MaxKeys: 5,
    });

    const response = await s3.send(command);

    console.log("✅ SUCCESS: Connected to AWS S3!");
    console.log(`📦 Bucket: ${process.env.AWS_BUCKET_NAME}`);
    console.log("📁 Files found:", response.KeyCount || 0);

    if (response.Contents?.length > 0) {
      console.log("\n📄 First few files:");
      response.Contents.forEach((file) => {
        console.log(" - ", file.Key);
      });
    }
  } catch (error) {
    console.error("\n❌ FAILED: Cannot access S3 bucket!");
    console.error("🪵 Error message:", error.message);
    console.error("📌 AWS Code:", error.name);

    console.error("\n🔧 Suggestions:");
    console.error("• Check if your ACCESS KEY & SECRET KEY are valid");
    console.error("• Ensure the Bucket name is 100% correct");
    console.error(`• Make sure the region matches (${process.env.AWS_REGION})`);
    console.error("• Ensure your IAM user has permissions:");
    console.error("  - s3:ListBucket");
    console.error("  - s3:PutObject");
    console.error("  - s3:GetObject");
  }
}

testS3();
