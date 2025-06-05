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
const Ticket = require('../models/Ticket');
const Backend_User = require('../models/User');
const User = require('../api/models/userModel');



app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});


    async function add_user_ajax(req, res) {
        try {

            console.log('Request Body:', req.body);
            const { UserName, UserMobile, Userpassword, Status } = req.body;
    
            // Validate required fields
            if (!UserName || !UserMobile || Status === undefined) {
                return res.status(400).json({ message: 'Name, mobile, and status are required.' });
            }
    
            // Create user
            const newUser = await User.create({
                name : UserName,
                mobile : UserMobile,
                password : Userpassword,
                Status
            });
    
            return res.status(201).json({ message: 'User added successfully.', data: newUser });
        } catch (error) {
            console.error('Error adding user:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }








async function get_all_ticket_ajax(req, res) {
    const requestData = req.body || {}; 

    // Safely access properties with defaults
    const start = parseInt(requestData.start) || 0; // Default to 0
    const length = parseInt(requestData.length) || 10; // Default to 10

    try {
        // Get total count of records
        const totalCount = await Ticket.count({
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
                        { user_id: { [Op.like]: `%${searchValue}%` } },
                        { user_query: { [Op.like]: `%${searchValue}%` } }
                        
                    ]
                }
            ];
        }
    
        // Get filtered count using the whereClause
        const filteredCount = await Ticket.count({ where: whereClause });

        // Get filtered data
        const user = await Ticket.findAll({
            where: whereClause,
            
            order: [['id', 'DESC']],
            offset: start,
            limit: length,
        });
        

        // Format the data for DataTables
        const data = user.map(row => { 
            return [
                row.id,
                row.user_id, // Column 1
                row.user_query,
                // row.user?.name || row.TrnBy, // Column 3 (use TrnBy if name is not available)
                // row.TrnOn, // Column 4
                row.Query_status === 2
                    ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Closed</span>`
                    : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span>Open</span>`, // Column 5
                row.Status === 2
                    ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>`
                    : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span>Enabled</span>`, // Column 5
                `
                        <a class='view_data_chk btn-xs bold' href='/ticket/edit_ticket/${row.user_id}'>
                        <a class='btn-xs bold'  href="javascript:void(0)" onclick="openChatModal(${row.user_id})" class="btn btn-sm btn-info"> Chat</a>

                            <i class='fa fa-pencil' aria-hidden='true'></i> Mark closed</a>
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
async function edit_ticket(req, res) {
    try {
        const id = req.params.id;

        const raise_ticket = await Ticket.findAll({
            where: { user_id: id },
            include: [
                {
                    model: User,
                    attributes: ['name'], // Only fetch 'name' from User
                }
            ]
        });

        if (!raise_ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(raise_ticket);
    } catch (error) {
        console.error('Error fetching ticket by ID:', error);
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

async function updateTicket(req, res) {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ error: "Form parsing failed" });
            }

            const id = req.params.id;
            const admin_reply = fields.admin_reply ? fields.admin_reply[0] : null;
                       const sender = fields.sender ? fields.sender[0] : null;


            // if (!Q_status) {
            //     return res.status(400).json({ message: 'User Name is required' });
            // }

            // let updateData = {
            //     admin_reply :admin_reply,
               
            // };
                // If no image was uploaded, just update the name
                // const [updated] = await Ticket.update(updateData, {
                //     where: { id: id }
                // });

                const newUser = await Ticket.create({
                user_id : 2,
                user_query : admin_reply,
                sender : sender,
                Query_status : 1,
                Status:2
            });

                if (newUser === 0) {
                    return res.status(404).json({ message: 'Ticket not found or no change made' });
                }

                res.json({ message: 'Ticket updated successfully' });
                return res.redirect('/Ticket_management');
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}




module.exports = {
    
    get_all_ticket_ajax,
    edit_ticket,
    status_change,
    updateTicket,
    add_user_ajax
   
};
