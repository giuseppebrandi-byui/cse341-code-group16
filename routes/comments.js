const router = require("express").Router()
const { commentValidationRules, validate } = require('../validation/validation-comments.js');
const commentsController = require("../controllers/comments")

router.get("/", commentsController.getAll);
router.get("/:id", commentsController.getSingle);
router.post("/", commentValidationRules(), validate, commentsController.createComment);
router.put("/:id", commentValidationRules(), validate, commentsController.updateComment);
router.delete("/:id", commentsController.deleteComment);


module.exports = router