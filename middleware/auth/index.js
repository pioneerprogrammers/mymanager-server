const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({
      errors: { common: { msg: "Access Denied: No token provided" } },
    });
  }

  try {
    const tokenDetails = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = tokenDetails;
    next();
  } catch (err) {
    return res.status(403).json({
      errors: { common: { msg: "Access Denied: Invalid token" } },
    });
  }
};
