const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { DataTypes } = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../connection');
//const db = require('../connection').promise();
const express = require('express');
const app = express();

const Healer = require('../models/Healer');
const User = require('../models/User');


// Define associations
User.hasMany(Healer, { foreignKey: 'TrnBy', sourceKey: 'id', as: 'healers' });

async function get_healers_data_list(req, res) {
    const requestData = req.body;
    // Safely access properties with defaults
    const start = parseInt(requestData.start) || 0; // Default to 0
    const length = parseInt(requestData.length) || 10; // Default to 10

    try {
        // Count total records
        const totalCount = await Healer.count({
            where: { Status: { [Op.ne]: 3 } } // Status != 3
        });

        // Prepare the search value and where clause
        const searchValue = requestData.search?.value || '';
        const whereClause = {
            Status: { [Op.ne]: 3 }
        };

        // Add search condition if search value is present
        if (searchValue) {
            whereClause.HealerName = {
                [Op.like]: `%${searchValue}%`
            };
        }

        // Get filtered data
        const filteredData = await Healer.findAndCountAll({
            where: whereClause,
            order: [['Healer_MstId', 'DESC']],
            offset: start,
            limit: length,
        });

        // Map the result to the desired format
        const data = filteredData.rows.map(r => [
            r.HealerName || 'NA',
            r.HealerSlug || 'NA',
            `<img src="${r.ProfilePicture || 'uploads/images/dummy_user.png'}" alt="Profile Picture" style="width: 50px; height: 50px;"/>`,
            r.Mobile || 'NA',
            r.EmailId || 'NA',
            r.Gender === 1 ? 'Male' : r.Gender === 2 ? 'Female' : 'NA',
            r.IsLive ? 'checked' : '',
            r.IsPro ? 'checked' : '',
            r.HealerCreatedDateTime || 'NA',
            r.Status === 2 
                ? '<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>' 
                : '<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span> Enabled</span>',
            
               `<div class="dropdown toggle_menus_icons show">
                <button class="btn dropdown-toggle bd4" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><a class="dropdown-item view_data_chk" href="view/${r.Healer_MstId}">View</a></li>
                    <li><a class="dropdown-item edit_data_chk" href="edit/${r.Healer_MstId}">Edit</a></li>
                    <li>
                        ${r.Status === 1 
                            ? `<a class='dropdown-item disable_menu' href='javascript:void(0)' id='${r.Healer_MstId}'>Disable</a>` 
                            : `<a class='dropdown-item enable_menu' href='javascript:void(0)' id='${r.Healer_MstId}'>Enable</a>`
                        }
                    </li>
                </ul>
            </div>`
            
            ]);

        // Send response
        res.json({
            draw: requestData.draw,
            recordsTotal: totalCount,
            recordsFiltered: filteredData.count,
            data: data
        });
    } catch (error) {
        console.error('Error fetching healers:', error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
}

// Update healer positions
const updateHealerPosition = async (req, res) => {
    const { position } = req.body;

    try {
        for (let i = 0; i < position.length; i++) {
            await Healer.update(
                { PositionOrder: i + 1 },
                { where: { Healer_MstId: position[i], Status: 1 } }
            );
        }

        return res.json({ success: true, message: 'Position updated successfully' });

    } catch (error) {
        console.error("Error updating healer position:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


// Get healer position list
const getHealerPositionList = async (req, res) => {
    let html = '';

    try {
        // Count the total number of healers with Status = 1
        const totalHealer = await Healer.count({
            where: { Status: 1 }
        });

        if (req.body) {
            html += `<div class="row mt-3">
                        <div class="col-md-6">
                            <p class="mb-0 hamburger_para">Healer Position List</p>`;

            // Query to get healers where Status is 1 and order by PositionOrder
            const healers = await Healer.findAll({
                where: { Status: 1 },
                order: [['PositionOrder', 'ASC']],
                limit: totalHealer
            });

            if (healers.length) {
                html += `<div class="hamurger_detail ham_dashboard_dt row_position">`;
                healers.forEach((healer, index) => {
                    html += `<div class="hamburger_content bg-white bd4 p-1 mt-3" id="${healer.Healer_MstId}">
                                <p class="mb-0">${index + 1} - ${healer.HealerName}</p>
                            </div>`;
                });
                html += `</div>`;
            } else {
                html += `<p>No data found</p>`;
            }

            html += `</div></div>`;
        } else {
            html += `<p>No data found</p>`;
        }

        return res.send(html);

    } catch (error) {
        console.error("Error fetching healer position list:", error);
        return res.status(500).send("Internal Server Error");
    }
};


module.exports = {
    get_healers_data_list,
    getHealerPositionList,
    updateHealerPosition
};
