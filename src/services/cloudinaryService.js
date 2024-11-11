import axios from "axios";
import sha1 from "crypto-js/sha1";

const CLOUDINARY_UPLOAD_PRESET = "rmlnseof";
const CLOUDINARY_CLOUD_NAME = "dg1zyxy3f";
const CLOUDINARY_API_KEY = "315185827846495";
const CLOUDINARY_API_SECRET = "a5hXJ7nO2IbuJDVKcnFcU8nUv8I";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_DELETE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`;

const cloudinaryService = {
  uploadImage: async (imageFile, oldPublicId = null) => {
    if (!imageFile) return null;

    try {
      // Delete old image if exists
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId);
      }

      // Upload new image
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "mini-project-altera");

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { secure_url, public_id } = response.data;
      return {
        url: secure_url,
        publicId: public_id,
      };
    } catch (error) {
      console.error("Error during Cloudinary upload:", error);
      throw error;
    }
  },

  deleteImage: async (publicId) => {
    if (!publicId) return;

    try {
      const timestamp = new Date().getTime();
      const signature = sha1(
        `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
      ).toString();

      await axios.post(
        CLOUDINARY_DELETE_URL,
        {
          public_id: publicId,
          timestamp: timestamp,
          api_key: CLOUDINARY_API_KEY,
          signature: signature,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(`Successfully deleted image with public_id: ${publicId}`);
      return true;
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      throw error;
    }
  },
};

export default cloudinaryService;
