const ImageKit = require("imagekit");
require("dotenv").config();

console.log("🧩 Loading ImageKit credentials...");
console.log({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? "✅ Loaded" : "❌ Missing",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(fileBuffer, fileName) {
  try {
    console.log("📤 Uploading file:", fileName);

    // Convert buffer to Base64
    const base64File = fileBuffer.toString("base64");

    const result = await imagekit.upload({
      file: base64File, // ✅ must be Base64 string or file path
      fileName,
    });

    console.log("✅ File uploaded successfully:", result.url);
    return result;
  } catch (error) {
    console.error("❌ ImageKit upload error:");
    console.error("Error message:", error.message);
    console.error("Full error object:", error);
    throw new Error(error.message);
  }
}

module.exports = { uploadFile };
