const router = require("express").Router()
const { commentValidationRules, validate } = require('../validation/validation-comments.js');
const commentsController = require("../controllers/comments");
const { isAuthenticated } = require('../auth/authenticate');

router.get("/", commentsController.getAll);
router.get("/:id", commentsController.getSingle);
router.post("/", isAuthenticated, commentValidationRules(), validate, commentsController.createComment);
router.put("/:id", isAuthenticated, commentValidationRules(), validate, commentsController.updateComment);
router.delete("/:id", isAuthenticated, commentsController.deleteComment);


module.exports = router