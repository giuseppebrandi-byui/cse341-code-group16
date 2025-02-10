
const router = require("express").Router()
const { newsletterValidationRules, validate } = require('../validation/validation-newsletters.js');
const newsletterController = require("../controllers/newsletters");
const { isAuthenticated } = require('../auth/authenticate');

router.get("/", newsletterController.getAll);
router.get("/:id", newsletterController.getSingle);
router.post("/", isAuthenticated, newsletterValidationRules(), validate, newsletterController.createNewsLetter)
router.put("/:id", isAuthenticated, newsletterValidationRules(), validate, newsletterController.updateNewsLetter)
router.delete("/:id", isAuthenticated, newsletterController.deleteNewsLetter)


module.exports = router