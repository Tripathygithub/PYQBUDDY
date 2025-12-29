var express = require('express');
var router = express.Router();

var authRouter = require('./auth');
var adminsRouter = require('./admin');
var adminNewRouter = require('./adminNew');
var adminSimplifiedRouter = require('./adminSimplified');
var usersRouter = require('./user');
var questionRouter = require('./question');
var mediaRouter = require('./media');

const middleware = require('../../service/middleware').middleware;

// Auth routes (no middleware - public endpoints)
router.use('/auth', authRouter);

// Public question routes (no authentication required)
router.use('/questions', questionRouter);

// Media routes (authentication required for uploads)
router.use('/media', mediaRouter);

// Protected routes (middleware applied)
router.use(middleware); 

router.use('/admin', adminsRouter);
router.use('/admin-v2', adminNewRouter);  // New question management system
router.use('/admin-panel', adminSimplifiedRouter);  // Simplified admin panel (ACTIVE)
router.use('/user', usersRouter);

module.exports = router;