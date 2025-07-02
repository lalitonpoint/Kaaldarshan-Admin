// categoryRoutes.js
const express = require('express');
const router = express.Router();

const bannerController = require('../controllers/bannerController');
const usercon  = require('../controllers/userController')

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions

router.post('/add_category_ajax', bannerController.addCategory);
router.post('/get_all_banners_ajax', bannerController.get_all_banners_ajax);
router.post('/get_wall_menu_data', bannerController.get_wall_menu_data);
router.post('/category_menu_position', bannerController.category_menu_position);
router.post('/billing_details',usercon.aws_billing_details);


// Export the router
module.exports = router;
