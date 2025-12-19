var express = require('express');
var router = express.Router();
const multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });


///////////////////////////////////////  epin ///////////////////////////////////////////////////


module.exports = router;