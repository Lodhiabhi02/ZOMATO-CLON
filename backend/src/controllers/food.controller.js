const { v4: uuid } = require("uuid");
const foodModel = require('../models/food.model');
const storageService = require('../../services/storage.service');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');

async function createFood(req, res) {
  try {
    console.log("[LOG] createFood called");
    if (!req.foodPartner) {
      console.warn("[WARN] Food partner not authenticated");
      return res.status(401).json({ message: "Food partner not authenticated" });
    }

    if (!req.file) {
      console.warn("[WARN] No video file provided");
      return res.status(400).json({ message: "Video file is required" });
    }

    console.log("[LOG] Uploading file...");
    const fileUploadResult = await storageService.uploadFile(req.file, uuid());
    console.log("[LOG] File uploaded:", fileUploadResult.url);

    const foodItem = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      video: fileUploadResult.url,
      foodPartner: req.foodPartner._id,
      likeCount: 0,
      savesCount: 0
    });

    console.log("[LOG] Food created:", foodItem._id);

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
  try {
    console.log("[LOG] getFoodItems called");
    const foodItems = await foodModel.find({})
      .populate('foodPartner', 'name email') // optional: show food partner info
      .sort({ createdAt: -1 }); // newest first

    console.log("[LOG] Fetched foods:", foodItems.length);
    res.status(200).json({ message: "Food items fetched successfully", foodItems });
  } catch (error) {
    console.error("❌ getFoodItems Error:", error);
    res.status(500).json({ message: "Error fetching foods", error: error.message });
  }
}

async function likeFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    console.log(`[LOG] likeFood called by user ${user._id} on food ${foodId}`);

    const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

    if (isAlreadyLiked) {
      await likeModel.deleteOne({ user: user._id, food: foodId });
      await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });
      console.log("[LOG] Food unliked:", foodId);
      return res.status(200).json({ message: "Food unliked successfully" });
    }

    const like = await likeModel.create({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });

    console.log("[LOG] Food liked:", foodId);
    res.status(201).json({ message: "Food liked successfully", like });
  } catch (error) {
    console.error("❌ likeFood Error:", error);
    res.status(500).json({ message: "Like error", error: error.message });
  }
}

async function saveFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    console.log(`[LOG] saveFood called by user ${user._id} on food ${foodId}`);

    const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

    if (isAlreadySaved) {
      await saveModel.deleteOne({ user: user._id, food: foodId });
      await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } });
      console.log("[LOG] Food unsaved:", foodId);
      return res.status(200).json({ message: "Food unsaved successfully" });
    }

    const save = await saveModel.create({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } });

    console.log("[LOG] Food saved:", foodId);
    res.status(201).json({ message: "Food saved successfully", save });
  } catch (error) {
    console.error("❌ saveFood Error:", error);
    res.status(500).json({ message: "Save error", error: error.message });
  }
}

async function getSaveFood(req, res) {
  try {
    const user = req.user;
    console.log("[LOG] getSaveFood called by user:", user._id);

    const savedFoods = await saveModel.find({ user: user._id })
      .populate({
        path: 'food',
        populate: { path: 'foodPartner', select: 'name email' }
      });

    if (!savedFoods.length) {
      console.log("[LOG] No saved foods found");
      return res.status(404).json({ message: "No saved foods found" });
    }

    console.log("[LOG] Saved foods retrieved:", savedFoods.length);
    res.status(200).json({ message: "Saved foods retrieved successfully", savedFoods });
  } catch (error) {
    console.error("❌ getSaveFood Error:", error);
    res.status(500).json({ message: "Fetch saved foods error", error: error.message });
  }
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSaveFood,
};
