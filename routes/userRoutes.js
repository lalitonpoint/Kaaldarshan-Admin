// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController'); // Correct controller


// routes/userRoutes.js
router.post('/get_all_user_ajax', userController.get_all_user_ajax);
router.get('/edit_user/:id', userController.edit_user);
router.get('/status_change/:id/:Status', userController.status_change);
router.post('/updateUser/:id', userController.updateUser);


module.exports = router;
