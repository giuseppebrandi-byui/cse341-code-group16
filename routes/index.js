const router = require('express').Router();

router.get('/', (req, res) => { res.send('Hello World') });

router.use('/patients', require('./patients'));

module.exports = router;