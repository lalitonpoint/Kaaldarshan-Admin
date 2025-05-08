// categoryRoutes.js
const express = require('express');
const loginRoutes = require('../routes/signup');
const router = express.Router();

router.use('/signup',loginRoutes);

module.exports = router;


