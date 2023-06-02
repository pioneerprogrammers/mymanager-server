const router = require("express").Router();

const {
  contactList,
  contactAdd,
  contactById,
  updateContact,
  uploadAvatar,
  updateSocialLink,
  rankAddOrUpdate,
  deleteRank,
  fileAddAndUpdate,
  deleteFile,
  updateBillingAddress,
  totalEmployee,
  activeEmployee,
  internshipEmployee,
  formerEmployee,
  deleteContact,
  importContactsFromArray,
  employeePosition,
  getEmployeePositions,
  getAllEmployees,
  deleteEmployeePosition,
  putEmployeePosition,
} = require("../controllers/employeeContact");
const results = require("../validators");
const isAuthenticated = require("../middleware/auth");

// UPload Handler
const { upload } = require("./../lib/upload");

router.get("/list", isAuthenticated, contactList);
router.post("/add", isAuthenticated, contactAdd);
router.get("/contact/:id", isAuthenticated, contactById);
router.post("/contact-update", isAuthenticated, updateContact);
router.post("/update-social-links", isAuthenticated, updateSocialLink);

// Update Billing address
router.post("/billing-address-update", isAuthenticated, updateBillingAddress);

// ** delete Rank
router.post("/delte-rank", isAuthenticated, deleteRank);
// ** file Delete Action

router.post("/file-delete", isAuthenticated, deleteFile);

router.post(
  "/upload-avatar",
  isAuthenticated,
  upload.single("file"),
  uploadAvatar
);

// Rank Add Or Update
router.post(
  "/rank-add-or-update",
  isAuthenticated,
  upload.single("file"),
  rankAddOrUpdate
);

// Files Add
router.post(
  "/file-add",
  isAuthenticated,
  upload.single("file"),
  fileAddAndUpdate
);

// total counts

router.get("/total-employee", isAuthenticated, totalEmployee);
router.get("/active-employee", isAuthenticated, activeEmployee);
router.get("/internship-employee", isAuthenticated, internshipEmployee);
router.get("/former-employee", isAuthenticated, formerEmployee);

router.post("/delete", isAuthenticated, deleteContact);

router.post("/import-contact-array", isAuthenticated, importContactsFromArray);

// Create New Employee Position
router.post("/position", isAuthenticated, employeePosition);

//get all employee positions
router.get("/position", isAuthenticated, getEmployeePositions);

//get all employees
router.get("/allemployees", isAuthenticated, getAllEmployees);

//delete position
router.delete("/position/:id", isAuthenticated, deleteEmployeePosition);

//update position
router.put("/position/:id", isAuthenticated, putEmployeePosition);

module.exports = router;
