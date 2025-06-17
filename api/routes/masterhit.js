// categoryRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const masterhitController = require('../controller/master_hit');

router.post('/content', masterhitController.content);
// router.post('/login', masterhitController.login);


// Export the router
module.exports = router;
