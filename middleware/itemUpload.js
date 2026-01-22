import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "quickbite/items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const itemUpload = multer({ storage });

export default itemUpload;
