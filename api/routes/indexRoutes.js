// categoryRoutes.js
const express = require('express');
const loginRoutes = require('../routes/signup');
const ticketRoutes = require('../routes/user');
const masterhitRoutes = require('../routes/masterhit');
const chat  = require('../routes/chat');
const router = express.Router();

router.use('/signup',loginRoutes);
router.use('/user',ticketRoutes);
router.use('/master_hit',masterhitRoutes);
router.use('/chat',chat);

module.exports = router;


