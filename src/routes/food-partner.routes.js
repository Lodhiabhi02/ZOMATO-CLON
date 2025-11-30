const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const foodPartnerController = require('../controllers/food-partner.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Register a new food partner
router.post('/register', authController.registerFoodPartner);

// Login food partner
router.post('/login', authController.loginFoodPartner);

// Logout food partner
router.get('/logout', authController.logoutFoodPartner);

// Get food partner by ID
router.get('/:id',
    authMiddleware.authUserMiddleware,
    foodPartnerController.getFoodPartnerById
);

module.exports = router;
