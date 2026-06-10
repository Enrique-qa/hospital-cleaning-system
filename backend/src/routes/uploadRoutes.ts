import { Router } from "express";
import multer from "multer";
import path from "path";
import { UploadController } from "../controllers/uploadController";

const uploadRoutes = Router();
const uploadController = new UploadController();

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, "..", "..", "uploads"),

  filename: (req, file, callback) => {
    const timestamp = Date.now();

    const extension = path.extname(file.originalname).toLowerCase();

    const safeName = path
      .basename(file.originalname, extension)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase();

    callback(null, `${timestamp}-${safeName}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Formato de imagem inválido."));
    }

    callback(null, true);
  },
});

uploadRoutes.post(
  "/uploads/entities",
  upload.single("image"),
  uploadController.uploadEntityImage
);

export { uploadRoutes };