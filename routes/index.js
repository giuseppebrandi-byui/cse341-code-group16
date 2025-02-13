const router = require('express').Router();
const passport = require('passport');

// router.get('/', (req, res) => { res.send('Hello World') });

router.use('/patients', require('./patients') /*#swagger.tags=['Patients']*/ );
router.use('/practitioners', require('./practitioners') /*#swagger.tags=['Practitioners']*/ );
router.use("/newsletters", require("./newsletters") /*#swagger.tags=['Newsletters']*/ )
router.use("/comments", require("./comments") /*#swagger.tags=['Comments']*/)
router.use('/zips', require('./zips') /*#swagger.tags=['Zip Codes']*/);
router.use("/api-docs", require("./apiDocs"));

router.get('/login', /*#swagger.tags=['OAuth'] #swagger.summary='Log in route' #swagger.description='Log in route'*/ passport.authenticate('github'), (req, res) => { });

router.get('/logout', /**#swagger.tags=['OAuth'] #swagger.summary='Log out route' #swagger.description='Log out route'*/ function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;