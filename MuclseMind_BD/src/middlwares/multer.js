// /Local storage ////

const multer = require("multer");
const path = require("path");
const fs = require('fs');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;



/////cloudinary storage///////////

// require('dotenv').config(); 
// const multer = require("multer");
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY,       
//   api_secret: process.env.CLOUDINARY_API_SECRET, 
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'uploads', 
//     allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'avi'], 
//   },
// });


// const upload = multer({ storage: storage });

// module.exports = { upload, cloudinary };

