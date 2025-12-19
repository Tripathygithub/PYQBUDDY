var express = require('express');
var router = express.Router();

var authRouter = require('./auth');
var adminsRouter = require('./admin');
var usersRouter = require('./user');

const middleware = require('../../service/middleware').middleware;

// Auth routes (no middleware - public endpoints)
router.use('/auth', authRouter);

// Protected routes (middleware applied)
router.use(middleware); 

router.use('/admin', adminsRouter);
router.use('/user', usersRouter);

module.exports = router;