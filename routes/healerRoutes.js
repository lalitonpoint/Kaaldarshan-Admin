// categoryRoutes.js
const express = require('express');
const router = express.Router();

const healerController = require('../controllers/healerController');

// Middleware for parsing application/json
router.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded (for form submissions)
router.use(express.urlencoded({ extended: true }));

// Define the POST routes to handle AJAX form submissions

router.post('/get_healers_data_list', healerController.get_healers_data_list);
router.post('/update_position_list', healerController.updateHealerPosition);
router.post('/ajax_position_list', healerController.getHealerPositionList);


// Export the router
module.exports = router;
