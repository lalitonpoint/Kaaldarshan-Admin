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
const Category = require('../models/Category');
const Backend_User = require('../models/User');
const User = require('../api/models/userModel');
const Plan = require('../models/Subscription')




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



async function get_all_user_ajax(req, res) {
    const requestData = req.body || {}; 

    // Safely access properties with defaults
    const start = parseInt(requestData.start) || 0; // Default to 0
    const length = parseInt(requestData.length) || 10; // Default to 10

    try {
        // Get total count of records
        const totalCount = await User.count({
            where: { Status: { [Op.ne]: 3 } }
        });

        const searchValue = requestData.search?.value || '';
        const whereClause = {
            Status: { [Op.ne]: 3 }
        };

        if (searchValue) {
            whereClause[Op.and] = [
                { Status: { [Op.ne]: 3 } },
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchValue}%` } },
                        { mobile: { [Op.like]: `%${searchValue}%` } },
                        { password: { [Op.like]: `%${searchValue}%` } },
                        { Status: { [Op.like]: `%${searchValue}%` } }
                    ]
                }
            ];
        }
    
        // Get filtered count using the whereClause
        const filteredCount = await User.count({ where: whereClause });

        // Get filtered data
        const user = await User.findAll({
            where: whereClause,
            // include: [
            //     {
            //         model: User,
            //         as: 'createdBy',
            //         attributes: ['name'],
            //     }
            // ],
            order: [['id', 'DESC']],
            offset: start,
            limit: length,
        });
        

        // Format the data for DataTables
        const data = user.map(row => { console.log(row);
            return [
                row.id,
                row.name, // Column 1
                row.mobile,
                // row.user?.name || row.TrnBy, // Column 3 (use TrnBy if name is not available)
                // row.TrnOn, // Column 4
                row.Status === 2
                    ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>`
                    : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span>Enabled</span>`, // Column 5
                `
                        <a class='view_data_chk btn-xs bold' href='/user/edit_user/${row.id}'>
                            <i class='fa fa-pencil' aria-hidden='true'></i> Edit</a>
                        ${row.Status === 1 ? `<a class='disable_menudd btn-xs bold' href='/user/status_change/${row.id}/${row.Status}' id='${row.id}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Disable</a>` : ''}
                        ${row.Status === 2 ? `<a class='enable_menu1 btn-xs bold' href='/user/status_change/${row.id}/${row.Status}' id='${row.id}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Enable</a>` : ''}
                        <a class='btn-xs bold delete_menu1'href='/user/status_change/${row.id}/3' id='${row.id}'>
                            <i class='fa fa-trash' aria-hidden='true'></i> Delete</a>
                    ` // Column 6 (action buttons)
            ];
        });

        // Return JSON response
        res.json({
            draw: requestData.draw, // Provide default draw value
            recordsTotal: totalCount,
            recordsFiltered: filteredCount, // Use the filteredCount for recordsFiltered
            data: data // Ensure 'data' is an array of arrays
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            status: false,
            message: 'Database error occurred.'
        });
    }
}
async function edit_user (req, res){
    try {
        const user_id = req.params.id;
    
        const user = await User.findOne({
            where: {
                id: user_id
            }
    });
    
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user); // Return the single category
    } catch (error) {
        console.error('Error fetching user by ID:', error);
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
        const [updated] = await User.update(
            { Status: newStatus },
            { where: { id: id } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'User not found or status unchanged' });
        }

        return res.redirect('/user');

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function updateUser(req, res) {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ error: "Form parsing failed" });
            }

            const id = req.params.id;
            const userName = fields.userName ? fields.userName[0] : null;
            const userMobile = fields.userMobile ? fields.userMobile[0] : null;
            const Status = fields.Status ? fields.Status[0] : null;

            if (!userName) {
                return res.status(400).json({ message: 'User Name is required' });
            }

            if (!userMobile) {
                return res.status(400).json({ message: 'user Mobile  is required' });
            }

            let updateData = {
                name: userName,
                mobile :userMobile,
                Status : Status
            };
                // If no image was uploaded, just update the name
                const [updated] = await User.update(updateData, {
                    where: { id: id }
                });

                if (updated === 0) {
                    return res.status(404).json({ message: 'User not found or no change made' });
                }

                res.json({ message: 'User updated successfully' });
                return res.redirect('/user');
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}




module.exports = {
    
    get_all_user_ajax,
    edit_user,
    status_change,
    updateUser,
    add_plan_ajax
   
};
