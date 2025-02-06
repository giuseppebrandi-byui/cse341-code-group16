const express = require('express');
const mongodb = require('./data/database');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use('/', require('./routes'));

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else { 
    app.listen(port, () => { 
      console.log(`Database is listening and running on port ${port}`);
    });
  }
});

app.use(function (error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  } else {
    res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    res.send({
      error
    });
  }

});

