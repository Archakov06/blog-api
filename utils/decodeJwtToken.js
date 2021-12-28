const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

module.exports.decodeJwtToken = (req, res, next) => {
  if (req.headers.authorization) {
    return jwt.verify(
      req.headers.authorization,
      process.env.JWT_KEY,
      async (err, payload) => {
        if (payload) {
          const userId = payload.userId;
          const user = await User.findById(userId);
          if (user && user._id.toString() === userId) {
            req.userId = userId;
          }
        }
        next();
      }
    );
  }

  next();
};
