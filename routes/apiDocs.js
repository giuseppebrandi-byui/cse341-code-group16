const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger-output.json");

router.use("/", /*#swagger.ignore = true*/ swaggerUi.serve);
router.get("/", /*#swagger.ignore = true*/ swaggerUi.setup(swaggerDocument));

module.exports = router;
