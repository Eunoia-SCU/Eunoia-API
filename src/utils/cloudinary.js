const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Upload Stream
exports.uploadToCloudinary = (buffer, filename, folder) => {
  return new Promise((resolve, reject) => {
    const options = {
      public_id: filename,
      resource_type: 'auto',
      folder: folder,
    };
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

exports.deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

exports.extractPublicIdFromImageLink = (imageLink) => {
  const splitLink = imageLink.split('/');
  const publicIdWithExtension = splitLink[splitLink.length - 1];
  const publicId = publicIdWithExtension.split('.')[0]; // Remove file extension
  return publicId;
};
