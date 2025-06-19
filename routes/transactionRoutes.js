// categoryRoutes.js
const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions
router.post('/get_all_order_ajax', transactionController.get_all_order_ajax);
router.get('/status_change/:id/:Status', transactionController.status_change);


// Export the router
module.exports = router;
