const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog");
const { verifyToken, checkRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public (bisa lihat artikel)
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// Hanya admin yang bisa tambah/edit/hapus
router.post("/", verifyToken, checkRole(["admin"]), blogController.createBlog);
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  blogController.updateBlog,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  blogController.deleteBlog,
);

// Upload foto artikel blog (admin)
router.post(
  "/:id/upload-foto",
  verifyToken,
  checkRole(["admin"]),
  upload.single("foto"),
  blogController.uploadFotoBlog,
);

module.exports = router;
