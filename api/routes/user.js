// categoryRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const userController = require('../controller/user');

router.post('/raise_ticket', userController.raise_ticket);
router.post('/login', userController.login);
router.post('/forgot_password', userController.forgot_password);
router.post('/intitiate_order', userController.intitiate_order);
router.post('/model_data',userController.model_data);
router.post('/user_api_call', userController.user_api_call);


// Export the router
module.exports = router;
