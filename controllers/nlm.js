const { expressjwt } = require("express-jwt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const { NLM_Admin, User, Authenticate } = require("../models");
const generateTokens = require("../Utilities/generateToken");
const {
  generateOTP,
  sendEmailVerification,
  phoneOtpSend,
} = require("../Utilities/generateOTP");

// Hash Password
const hashPass = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(password, salt);
  return hashed_password;
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Create a New Admin
// @route POST /{prefix}/nlm/create-admin
// @access Private
exports.createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, adminType } = req.body;

  const hashed_password = (await hashPass(password)).toString();

  // check if Admin exist
  const adminExist = await NLM_Admin?.findOne({ email });

  if (adminExist) {
    res.status(400);
    throw new Error("Admin with this email already exist!");
  }

  // check if super admin exist
  const superAdminExist = await NLM_Admin?.findOne({
    adminType: "super-admin",
  });

  if (superAdminExist !== null) {
    if (adminType === "super-admin") {
      res.status(400);
      throw new Error("Super Admin already exist");
    }
  }

  // Create Admin
  const admin = await NLM_Admin?.create({
    fullName,
    email,
    phone,
    password: hashed_password,
    adminType,
  });

  if (admin) {
    res.status(200).json({
      _id: admin.id,
      name: admin.fullName,
      email: admin.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid given data");
  }
});

// @desc Get Admins
// @route GET /{prefix}/nlm/admin
// @access Private
exports.getAdmin = asyncHandler(async (req, res) => {
  try {
    const admins = await NLM_Admin.find();

    if (admins) {
      res.status(200).json(admins);
    }
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

// @desc Update Admin
// @route PATCH /{prefix}/nlm/admin/:id
// @access Private
exports.updateAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, adminType } = req.body;
  const { id } = req.params;

  const hashed_password = (await hashPass(password)).toString();

  try {
    // check if admin exist
    const admin = await NLM_Admin.findById(id);
    if (!admin) {
      res.status(400);
      throw new Error("This admin does not exist");
    }

    // check if super admin exist
    const superAdminExist = await NLM_Admin?.findOne({
      adminType: "super-admin",
    });

    if (superAdminExist !== null) {
      if (adminType === "super-admin") {
        res.status(400);
        throw new Error("Super Admin already exist");
      }
    }

    // check if the requested admin is super admin
    const isSuperAdmin = await NLM_Admin?.findOne({
      _id: id,
      adminType: "super-admin",
    });

    if (!isSuperAdmin) {
      // Update admin
      admin.fullName = fullName ? fullName : admin.fullName;
      admin.email = email ? email : admin.email;
      admin.phone = phone ? phone : admin.phone;
      admin.password = password ? hashed_password : admin.password;
      admin.adminType = adminType ? adminType : admin.adminType;

      await admin.save();

      return res.status(200).json({
        success: "Admin updated successful",
      });
    } else {
      return res.status(401).json({
        prohibited: "Super Admin - adminType field - can not be changed",
      });
    }
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

// @desc Delete Admin
// @route DELETE /{prefix}/nlm/admin/:id
// @access Private
exports.deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // check if admin exist
    const admin = await NLM_Admin.findById(id);
    if (!admin) {
      res.status(400);
      throw new Error("This admin does not exist");
    }

    // check if super admin
    const isSuperAdmin = await NLM_Admin?.findOne({
      adminType: "super-admin",
      _id: id,
    });

    if (!isSuperAdmin) {
      await admin.remove();
      return res.status(200).json({
        success: "Admin deletion successful",
      });
    } else {
      return res.status(401).json({
        prohibited: "Super Admin can not be deleted",
      });
    }
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

// @desc LogIn Admin
// @route POST /{prefix}/nlm/login
// @access Public
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if admin exist
  const admin = await NLM_Admin.findOne({ email });

  if (!admin) {
    res.status(400);
    throw new Error("Admin with this email does not exist");
  } else {
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin.id,
        name: admin.fullName,
        email: admin.email,
        adminType: admin.adminType,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid Credential!");
    }
  }
});

// @desc Get MM Users
// @route GET /{prefix}/nlm/users
// @access Private
exports.users = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().populate("userId", "-hashed_password");

    if (users) {
      res.status(200).json(users);
    }
  } catch (err) {
    res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

// @desc Delte MM Users
// @route DELETE /{prefix}/nlm/users/:id
// @access Private
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // check if user exist
    const user = await User.findById(id);
    if (!user) {
      res.status(400);
      throw new Error("This user does not exist");
    }

    // Find the auth data of this user
    const authData = await Authenticate.findById(user.userId);

    // check if user has data somewhere else
    const hasOtherData = false;
    // ...

    // Delete User
    if (hasOtherData) {
      return res.status(401).json({
        prohibited:
          "Uable to delete. User has data associated with this account!",
      });
    } else {
      await user.remove();
      await authData?.remove();

      return res.status(200).json({
        success: "User Deleted!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});

// @desc Ban a User
// @route PATCH /{prefix}/nlm/users/:id
// @access Private
exports.banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // check if user exist
    const user = await User.findById(id);
    if (!user) {
      res.status(400);
      throw new Error("This user does not exist");
    }

    // Update admin
    user.isActive = !user.isActive;

    await user.save();

    return res.status(200).json({
      success: "User updated successful",
    });
  } catch (err) {
    return res.status(500).json({
      errors: { common: { msg: err.message } },
    });
  }
});
