const router = require("express").Router()

const commentsController = require("../controllers/comments")

router.get("/", commentsController.getAll);
router.get("/:id", commentsController.getSingle);
router.post("/", commentsController.createComment);
router.put("/:id", commentsController.updateComment);
router.delete("/:id", commentsController.deleteComment);


module.exports = router