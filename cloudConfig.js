const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:  process.env.CLOUD_API_SECRET
});
// Storage definations
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Wonderlust_dev',
    allowedformat: async (req, file) => ["png","jpg","jpeg"], // supports promises as well
  },
});


module.exports = {
    cloudinary,
    storage
}