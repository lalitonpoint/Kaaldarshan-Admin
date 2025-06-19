const { body, validationResult } = require('express-validator');
const multer = require('multer');
const multiparty = require('multiparty');  // Require multiparty
const fs = require('fs');

const path = require('path');
const { DataTypes } = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../connection');
//const db = require('../connection').promise();
const express = require('express');
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data
const User = require('../api/models/userModel')
const Plan = require('../models/Subscription')
const orders = require('../api/models/Order');




        app.use((req, res, next) => {
            console.log('Request Headers:', req.headers);
            console.log('Request Body:', req.body);
            next();
        });


    async function add_plan_ajax(req, res) {
        try {

            console.log('Request Body:', req.body);
            const { plan_name, plan_amount, plan_validity,plan_feature, Status } = req.body;
    
            // Validate required fields
            if (!plan_validity || !plan_name || Status === undefined) {
                return res.status(400).json({ message: 'Name, mobile, and status are required.' });
            }
           await Plan.sync();
            // Create user
            const newUser = await Plan.create({
                plan_name : plan_name,
                plan_amount : plan_amount,
                plan_validity : plan_validity,
                plan_feature : plan_feature,
                Status
            });
    
            return res.status(201).json({ message: 'Plan added successfully.', data: newUser });
        } catch (error) {
            console.error('Error adding user:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async function get_all_order_ajax(req, res) {
    const requestData = req.body || {};

    const start = parseInt(requestData.start) || 0;
    const length = parseInt(requestData.length) || 10;
    const searchValue = requestData.search?.value || '';

    try {
        // Total count without filters
        const totalCount = await orders.count({
            where: { Status: { [Op.ne]: 3 } }
        });

        // Setup filtering conditions
        const whereClause = {
            Status: { [Op.ne]: 3 }
        };

        const userWhere = {};

        if (searchValue) {
            whereClause[Op.or] = [
                { plan_name: { [Op.like]: `%${searchValue}%` } },
                { order_id: { [Op.like]: `%${searchValue}%` } },
                { plan_validity: { [Op.like]: `%${searchValue}%` } },
                { total_amount: { [Op.like]: `%${searchValue}%` } },
                { status: { [Op.like]: `%${searchValue}%` } }
            ];

            userWhere[Op.or] = [
                { name: { [Op.like]: `%${searchValue}%` } },
                { mobile: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        // Filtered count (with user search conditions)
        const filteredCount = await orders.count({
            where: whereClause,
            include: [
                {
                    model: User,
                    where: Object.keys(userWhere).length ? userWhere : undefined
                }
            ]
        });

        // Fetch filtered paginated data
        const user = await orders.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'mobile'],
                    where: Object.keys(userWhere).length ? userWhere : undefined
                }
            ],
            order: [['id', 'DESC']],
            offset: start,
            limit: length
        });

        // Format for DataTables
        const data = user.map(row => {
            return [
                row.id,
                row.User?.name || '',
                row.User?.mobile || '',
                row.plan_name,
                row.total_amount,
                row.plan_validity,
                row.order_id,
                row.status === 'completed'
                    ? `<span style="color: green; font-weight: bold;"><i class="fa fa-check-circle"></i> Complete</span>`
                    : row.status === 'pending'
                        ? `<span style="color: orange; font-weight: bold;"><i class="fa fa-clock-o"></i> Pending</span>`
                        : `<span style="color: red; font-weight: bold;"><i class="fa fa-times-circle"></i> Failed</span>`,
                row.createdAt
            ];
        });

        // Send DataTables response
        res.json({
            draw: requestData.draw || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: data
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            status: false,
            message: 'Database error occurred.'
        });
    }
}



async function edit_subscription (req, res){
    try {
        const subscription_id = req.params.id;
    
        const subscription = await Plan.findOne({
            where: {
                id: subscription_id
            }
    });
    
        if (subscription.length === 0) {
            return res.status(404).json({ message: 'subscription not found' });
        }
        res.json(subscription); // Return the single category
    } catch (error) {
        console.error('Error fetching subscription by ID:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function status_change(req, res) {
    try {
        const id = req.params.id;
        const currentStatus = parseInt(req.params.Status);
       

        if (isNaN(currentStatus)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        let newStatus;

        if(currentStatus===3){
             newStatus=3;
        }
        else{

         newStatus = currentStatus === 1 ? 2 : 1;
        }
        const [updated] = await Plan.update(
            { Status: newStatus },
            { where: { id: id } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'Plan not found or status unchanged' });
        }

        // return res.redirect('/user');

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function updatesubscription(req, res) {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ error: "Form parsing failed" });
            }

            const id = req.params.id;
            const plan_name = fields.plan_name ? fields.plan_name[0] : null;
            const plan_amount = fields.plan_amount ? fields.plan_amount[0] : null;
            const plan_valifity = fields.plan_valifity ? fields.plan_valifity[0] : null;
            const plan_feature = fields.plan_feature ? fields.plan_feature[0] : null;
            const Status = fields.Status ? fields.Status[0] : null;

            if (!plan_name) {
                return res.status(400).json({ message: 'Plan Name is required' });
            }

            if (!plan_amount) {
                return res.status(400).json({ message: 'Plan Amount  is required' });
            }
            if (!plan_valifity) {
                return res.status(400).json({ message: 'Plan Validity  is required' });
            }

            let updateData = {
                plan_name: plan_name,
                plan_amount :plan_amount,
                plan_valifity : plan_valifity,
                plan_feature : plan_feature,
                Status : Status
            };

             const existingBlog = await Plan.findOne({ where: { Id: id } });

            if (!existingBlog) {
                return res.status(404).json({ message: 'Plan not found' });
            }
                 await Plan.update(updateData, {
                where: { Id: id }
            });

            return res.json({ message: 'Plan updated successfully' });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}




module.exports = {
    
    get_all_order_ajax,
    edit_subscription,
    status_change,
    updatesubscription,
    add_plan_ajax
   
};
