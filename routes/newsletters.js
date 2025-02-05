const router = require("express").Router()

const newsletterController = require("../controllers/newsletters")

router.post("/", newsletterController.createNewsLetter)
router.put("/:id", newsletterController.updateNewsLetter)
router.delete("/:id", newsletterController.deleteNewsLetter)


module.exports = router