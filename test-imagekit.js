require('dotenv').config();
const ImageKit = require('imagekit');

// Log loaded environment variables safely
console.log("🧩 Checking ImageKit credentials...");
console.log({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "❌ Missing",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? "✅ Loaded" : "❌ Missing",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "❌ Missing"
});

// Check if any key is missing
if (
  !process.env.IMAGEKIT_PUBLIC_KEY ||
  !process.env.IMAGEKIT_PRIVATE_KEY ||
  !process.env.IMAGEKIT_URL_ENDPOINT
) {
  console.error("🚨 Missing one or more ImageKit environment variables. Check your .env file!");
  process.exit(1);
}

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Try listing files to confirm authentication
imagekit
  .listFiles({ limit: 1 })
  .then((files) => {
    console.log("✅ ImageKit authenticated successfully!");
    console.log("📁 Found files:", files.length);
  })
  .catch((err) => {
    console.error("❌ Authentication failed!");
    console.error("🪵 Error details:");
    console.error({
      message: err.message,
      statusCode: err.statusCode,
      help: "➡️ Verify that your Private Key and URL Endpoint are correct in the ImageKit dashboard.",
      suggestion: "If the region changed (usik / euik / ik), update your endpoint accordingly."
    });
  });
