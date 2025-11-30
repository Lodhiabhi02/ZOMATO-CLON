const { v4: uuid } = require("uuid");
const foodModel = require('../models/food.model');
const storageService = require('../../services/storage.service');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');

async function createFood(req, res) {
  try {
    console.log("📦 Received food creation request");
    console.log("➡️ Body:", req.body);
    console.log("➡️ File:", req.file ? req.file.originalname : "❌ No file uploaded");
    console.log("➡️ FoodPartner:", req.foodPartner ? req.foodPartner._id : "❌ Undefined");

    if (!req.foodPartner) {
      return res.status(401).json({ message: "Food partner not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    // Upload to ImageKit
    const fileUploadResult = await storageService.uploadFile(req.file, uuid());
    console.log("✅ ImageKit upload success:", fileUploadResult.url);

    const foodItem = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      video: fileUploadResult.url,
      foodPartner: req.foodPartner._id,
    });

    console.log("✅ MongoDB insert success:", foodItem._id);

    res.status(201).json({
      message: "Food created successfully",
      food: foodItem,
    });
  } catch (error) {
    console.error("❌ createFood Error:", error);
    res.status(500).json({ message: "Error creating food", error: error.message });
  }
}

async function getFoodItems(req, res) {
  const foodItems = await foodModel.find({});
  res.status(200).json({
    message: "Food items fetched successfully",
    foodItems,
  });
}

async function likeFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });
    return res.status(200).json({ message: "Food unliked successfully" });
  }

  const like = await likeModel.create({ user: user._id, food: foodId });
  await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });

  res.status(201).json({ message: "Food liked successfully", like });
}

async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

  if (isAlreadySaved) {
    await saveModel.deleteOne({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } });
    return res.status(200).json({ message: "Food unsaved successfully" });
  }

  const save = await saveModel.create({ user: user._id, food: foodId });
  await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } });

  res.status(201).json({ message: "Food saved successfully", save });
}

async function getSaveFood(req, res) {
  const user = req.user;
  const savedFoods = await saveModel.find({ user: user._id }).populate('food');

  if (!savedFoods.length) {
    return res.status(404).json({ message: "No saved foods found" });
  }

  res.status(200).json({
    message: "Saved foods retrieved successfully",
    savedFoods,
  });
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSaveFood,
};
