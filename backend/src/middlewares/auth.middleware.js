const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");

/**
 * Extract token from either cookies or Authorization header
 */
function getToken(req) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts[0] === "Bearer" && parts[1]) {
      token = parts[1];
    }
  }

  return token;
}

/**
 * Middleware for Food Partner authentication
 */
async function authFoodPartnerMiddleware(req, res, next) {
  try {
    const token = getToken(req); 

    if (!token) {
      return res.status(401).json({ message: "Please login as food partner first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foodPartner = await foodPartnerModel.findById(decoded.id);

    if (!foodPartner) {
      return res.status(404).json({ message: "Food Partner not found" });
    }

    req.foodPartner = foodPartner;
    next();
  } catch (err) {
    console.error("❌ Food Partner Auth Error:", err.message);
    res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Session expired, please login again"
          : "Invalid or unauthorized token",
    });
  }
}

/**
 * Middleware for User authentication
 */
async function authUserMiddleware(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ message: "Please login as user first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ User Auth Error:", err.message);
    res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Session expired, please login again"
          : "Invalid or unauthorized token",
    });
  }
}

module.exports = {
  authFoodPartnerMiddleware,
  authUserMiddleware,
};
