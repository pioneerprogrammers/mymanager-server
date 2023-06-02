const router = require("express").Router();

const { uploadFile } = require("../controllers/utill");
// UPload Handler
const { upload } = require("./../lib/upload");
router.post("/upload", uploadFile);

module.exports = router;
