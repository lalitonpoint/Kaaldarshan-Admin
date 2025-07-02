const { body, validationResult } = require('express-validator');
const multer = require('multer');
const multiparty = require('multiparty');  // Require multiparty
const fs = require('fs');
 require('dotenv').config();
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
const { CostExplorerClient, GetCostAndUsageCommand, GetCostForecastCommand } = require("@aws-sdk/client-cost-explorer");

const ACESS_KEY = process.env.ACESS_KEY_AWS;
const key_secret = process.env.SECRET_KEY_AWS;




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


const aws_billing_details = async (req, res) => {
  try {
    const client = new CostExplorerClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: ACESS_KEY,     // Replace with your actual access key
        secretAccessKey: key_secret, // Replac
      },
    });

    const startDate = "2025-06-01";
    const endDate = "2025-07-01";


    const forecastStart = "2025-07-02";
const forecastEnd = "2025-07-31";
    // 1. Daily Cost
   const dailyCommand = new GetCostAndUsageCommand({
  TimePeriod: { Start: startDate, End: endDate },
  Granularity: "DAILY",
  Metrics: ["UnblendedCost"]
})
    const dailyResponse = await client.send(dailyCommand);

    const dailyData = dailyResponse.ResultsByTime.map(entry => ({
      date: entry.TimePeriod.Start,
      amount: entry.Total.UnblendedCost.Amount,
      unit: entry.Total.UnblendedCost.Unit,
    }));

    // 2. Monthly Total
    const totalCommand = new GetCostAndUsageCommand({
        TimePeriod: { Start: startDate, End: endDate },
        Granularity: "MONTHLY",
        Metrics: ["UnblendedCost"]
        });
    const totalResponse = await client.send(totalCommand);
    const totalCost = totalResponse.ResultsByTime[0].Total.UnblendedCost;

    // 3. Forecast
    // 3. Forecast
        const forecastCommand = new GetCostForecastCommand({
        TimePeriod: { Start: forecastStart, End: forecastEnd },
        Granularity: "MONTHLY",
        Metric: "UNBLENDED_COST"
        });

    const forecastResponse = await client.send(forecastCommand);
    const forecast = forecastResponse.Total;

    // 4. Service-wise Breakdown
        const serviceCommand = new GetCostAndUsageCommand({
        TimePeriod: { Start: startDate, End: endDate },
        Granularity: "MONTHLY",
        Metrics: ["UnblendedCost"],
        GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }]
        });
    const serviceResponse = await client.send(serviceCommand);
    const serviceData = serviceResponse.ResultsByTime[0].Groups.map(group => ({
      service: group.Keys[0],
      amount: group.Metrics.UnblendedCost.Amount,
      unit: group.Metrics.UnblendedCost.Unit
    }));

    // 5. Combine response
    res.status(200).json({
      success: true,
      message: "AWS Billing details fetched successfully",
      totalCost,
      forecast,
      serviceBreakdown: serviceData,
      dailyBreakdown: dailyData
    });

  } catch (error) {
    console.error("Error fetching billing details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AWS billing details",
      error: error.message,
    });
  }
};






module.exports = {
    
    get_all_user_ajax,
    edit_user,
    status_change,
    updateUser,
    aws_billing_details,
    add_user_ajax
   
};
