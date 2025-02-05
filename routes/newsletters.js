const router = require("express").Router()

const newsletterController = require("../controllers/newsletters")

router.post("/", newsletterController.createNewsLetter)
router.delete("/:id", newsletterController.deleteNewsLetter)


module.exports = router