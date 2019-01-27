const express = require("express");
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const CanvasController = require('../controllers/canvas');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/gif") {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
    /* fileSize: 1080 * 1080 * 5 */
  },
  fileFilter: fileFilter
});

router.get("/", CanvasController.canvas_get_all);

router.post("/", checkAuth, upload.single('canvas_image'), CanvasController.canvas_create_canvas);

router.get("/:canvasId", CanvasController.canvas_get_canvas);

router.patch("/:canvasId", checkAuth, CanvasController.canvas_update_canvas);

router.delete("/:canvasId", checkAuth, CanvasController.canvas_delete);

module.exports = router;