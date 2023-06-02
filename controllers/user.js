const bcrypt = require("bcryptjs");

const { User } = require("../models");
const tokenGenerate = require("../Utilities/generateToken");

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, parseInt(10));

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const user = tokenGenerate(newUser);

    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ errors: { common: { msg: "Internal server error!" } } });
  }
};

module.exports = { signup };
