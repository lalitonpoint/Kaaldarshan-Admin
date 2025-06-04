// categoryRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const userController = require('../controller/user');

router.post('/raise_ticket', userController.raise_ticket);
router.post('/login', userController.login);


// Export the router
module.exports = router;
