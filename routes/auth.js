const router = require("express").Router();

const {
  signup,
  login,
  validateToken,
  sendResetPassOTP,
  resetPass,
} = require("../controllers/auth");
const {
  signupValidator,
  loginValidator,
  resetPassValidator,
} = require("../validators/auth");
const results = require("../validators");

router.post("/signup", signupValidator, results, signup);
router.post("/signin", loginValidator, results, login);
router.post(
  "/send-reset-pass-otp",
  resetPassValidator,
  results,
  sendResetPassOTP
);
router.patch("/reset-password", resetPassValidator, results, resetPass);
router.post("/validate-token", validateToken);

module.exports = router;
