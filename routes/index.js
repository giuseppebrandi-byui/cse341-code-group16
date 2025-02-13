const router = require('express').Router();
const passport = require('passport');

// router.get('/', (req, res) => { res.send('Hello World') });

router.use('/patients', require('./patients') /*#swagger.tags=['Patients']*/ );
router.use('/practitioners', require('./practitioners') /*#swagger.tags=['Practitioners']*/ );
router.use("/newsletters", require("./newsletters") /*#swagger.tags=['Newsletters']*/ )
router.use("/comments", require("./comments") /*#swagger.tags=['Comments']*/)
router.use('/practitioners', require('./practitioners'));
router.use('/zips', require('./zips'));
router.use("/api-docs", require("./apiDocs"));

router.get('/login', passport.authenticate('github'), (req, res) => { });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;