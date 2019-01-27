const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

const CommentsController = require("../controllers/comments");


router.get("/", CommentsController.comments_get_all);

router.post("/", checkAuth, CommentsController.comments_create_comment);

router.get("/:commentId", checkAuth, CommentsController.comments_get_comment);

router.delete("/:commentId", checkAuth, CommentsController.comment_delete);

module.exports = router;
