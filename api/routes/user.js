// categoryRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const userController = require('../controller/user');

router.post('/raise_ticket', userController.raise_ticket);
router.post('/login', userController.login);
router.post('/forgot_password', userController.forgot_password);


// Export the router
module.exports = router;
