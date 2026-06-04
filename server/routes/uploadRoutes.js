const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Upload single image
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadController.upload.single("image"),
  uploadController.uploadImage
);

// Delete image
router.delete(
  "/:filename",
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage
);

module.exports = router;
