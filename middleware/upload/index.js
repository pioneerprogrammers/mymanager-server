const datauriParser = require('datauri/parser');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const parser = new datauriParser();

// Initialize Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

// Cloudinary configuration start ***
const bufferToBase64 = (file) => {
	return parser.format(path.extname(file.originalname).toString(), file.buffer);
};

const cloudinaryUpload = (file) => cloudinary.uploader.upload(file);
// Cloudinary configuration end ***

// Multer Upload Controller start ***
const multer = require('multer');
const allowedFormat = ['image/jpg', 'image/png', 'image/jpeg'];
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	fileFilter: function (req, file, cb) {
		if (allowedFormat.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Not Supported file type'), false);
		}
	},
});
const singleUpload = upload.single('file');
const singleUploadControl = (req, res, next) => {
	singleUpload(req, res, (err) => {
		if (err) {
			return res.status(422).send({ message: 'image upload fail' });
		}
		next();
	});
};
// Multer Upload Controller end ***

module.exports = { cloudinaryUpload, singleUploadControl, bufferToBase64 };
