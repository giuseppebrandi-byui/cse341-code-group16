const router = require("express").Router()
const { newsletterValidationRules, validate } = require('../validation/validation-newsletters.js');
const newsletterController = require("../controllers/newsletters")

router.get("/", newsletterController.getAll);
router.get("/:id", newsletterController.getSingle);
router.post("/", newsletterValidationRules(), validate, newsletterController.createNewsLetter)
router.put("/:id", newsletterValidationRules(), validate, newsletterController.updateNewsLetter)
router.delete("/:id", newsletterController.deleteNewsLetter)


module.exports = router