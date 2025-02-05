const router = require("express").Router()

const newsletterController = require("../controllers/newsletters")

router.get("/", newsletterController.getAll);
router.get("/:id", newsletterController.getSingle);
router.post("/", newsletterController.createNewsLetter)
router.put("/:id", newsletterController.updateNewsLetter)
router.delete("/:id", newsletterController.deleteNewsLetter)


module.exports = router