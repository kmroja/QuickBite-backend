import multer from "multer";

const storage = multer.memoryStorage();

const uploadRestaurant = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadRestaurant;

