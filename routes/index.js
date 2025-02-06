const router = require('express').Router();

router.get('/', (req, res) => { res.send('Hello World') });

router.use('/patients', require('./patients') /*#swagger.tags=['Patients']*/ );
router.use("/newsletters", require("./newsletters") /*#swagger.tags=['Newsletters']*/ )
router.use("/comments", require("./comments") /*#swagger.tags=['Comments']*/ )
router.use("/api-docs", require("./apiDocs"))

module.exports = router;