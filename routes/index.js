const router = require('express').Router();

router.get('/', (req, res) => { res.send('Hello World') });

router.use('/patients', require('./patients'));
router.use("/newsletters", require("./newsletters"))
router.use("/comments", require("./comments"))
router.use("/api-docs", require("./apiDocs"))

module.exports = router;