const { UserToken } = require("../models");
const jwt = require("jsonwebtoken");

module.exports = (refreshToken) => {
  return new Promise((resolve, reject) => {
    UserToken.findOne({ token: refreshToken }, (err, doc) => {
      if (!doc) {
        return reject({ error: true, message: "Invalid refresh token" });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        (err, tokenDetails) => {
          if (err) {
            return reject({ error: true, message: "Invalid refresh token" });
          }
          resolve({
            tokenDetails,
            error: false,
            message: "Valid refresh token",
          });
        }
      );
    });
  });
};
