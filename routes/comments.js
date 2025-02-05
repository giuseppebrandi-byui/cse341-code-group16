const router = require("express").Router()

const commentsController = require("../controllers/comments")

router.post("/", commentsController.createComment)
router.delete("/:id", commentsController.deleteComment)


module.exports = router