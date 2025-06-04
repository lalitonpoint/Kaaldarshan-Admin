// categoryRoutes.js
const express = require('express');
const loginRoutes = require('../routes/signup');
const ticketRoutes = require('../routes/user');
const router = express.Router();

router.use('/signup',loginRoutes);
router.use('/user',ticketRoutes);

module.exports = router;


