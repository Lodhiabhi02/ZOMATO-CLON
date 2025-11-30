const express = require('express');
const router = express.Router();
const multer = require('multer');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/food  [Protected - Food Partner]
router.post(
  '/',
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"), // use same field name as in Postman
  foodController.createFood
);

// GET /api/food  [Protected - User]
router.get(
  '/',
  authMiddleware.authUserMiddleware,
  foodController.getFoodItems
);

// POST /api/food/like
router.post(
  '/like',
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

// POST /api/food/save
router.post(
  '/save',
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

// GET /api/food/save
router.get(
  '/save',
  authMiddleware.authUserMiddleware,
  foodController.getSaveFood
);

module.exports = router;
