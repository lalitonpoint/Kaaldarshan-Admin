// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController'); // Correct controller

// Route to test
// router.get('/', (req, res) => {
//     res.render('category/add_category');
// });

// routes/userRoutes.js
router.get('/userList', userController.userList); // NOT post

module.exports = router;
