// categoryRoutes.js
const express = require('express');
const loginRoutes = require('../routes/signup');
const ticketRoutes = require('../routes/user');
const masterhitRoutes = require('../routes/masterhit');
const router = express.Router();

router.use('/signup',loginRoutes);
router.use('/user',ticketRoutes);
router.use('/master_hit',masterhitRoutes);

module.exports = router;


