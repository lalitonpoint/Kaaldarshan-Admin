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
const Blog = require('../models/blog');
const About = require('../models/about');




app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});


// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            console.log('Invalid file type:', file.mimetype); // Log invalid file types
            return cb(new Error('Error: File upload only supports the following filetypes - jpeg, jpg, png'));
        }
    }
});



const addabout = [ 
    // upload.single('CategoryThumb'), // File upload middleware
    async (req, res) => {
        // Handle validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: false, message: errors.array() });
        }

        // Check for user session and handle errors
        if (!req.session || !req.session.user || !req.session.user.id) {
            return res.status(400).json({ status: false, message: 'User session is missing or invalid' });
        }


            const type = req.body.type || null;
            const description = req.body.description || null;
            
            const Status = req.body.Status || null;
            const currentDate = new Date();               
            await About.sync();
            try {
            // Insert the data into the database using Sequelize
            const blog = await About.create({
               
                type : type,
                Description:description,
                Status : Status,
                 Created: currentDate,
            });

            console.log('About us inserted successfully:', blog);
            return res.status(200).json({ status: true, message: 'About us added successfully!' });
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ status: false, message: 'Database error occurred while inserting category' });
        }
    }
];



async function get_all_about_ajax(req, res) {
    const requestData = req.body || {}; // Ensure requestData is defined
    // console.log('requested data', req.body);

    // Safely access properties with defaults
    const start = parseInt(requestData.start) || 0; // Default to 0
    const length = parseInt(requestData.length) || 10; // Default to 10

    try {
        // Get total count of records
        const totalCount = await About.count({
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
                        
                        { Description: { [Op.like]: `%${searchValue}%` } },
                       
                        { Status: { [Op.like]: `%${searchValue}%` } }
                    ]
                }
            ];
        }

        // Get filtered count using the whereClause
        const filteredCount = await About.count({ where: whereClause });

        // Get filtered data
        const about = await About.findAll({
            where: whereClause, // Use the whereClause for filtering
           
            order: [['Id', 'DESC']],
            offset: start,
            limit: length,
        });

        // Format the data for DataTables
        const data = about.map(row => {
            return [
                row.Id,
                row.Description,
                row.Status === 2
                    ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>`
                    : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fas fa-clock"></i></span>Enabled</span>`, // Column 5
                `
                        <a class='view_data_chk btn-xs bold' href='/about/edit_about/${row.Id}'>
                            <i class='fa fa-pencil' aria-hidden='true'></i> Edit</a>
                        ${row.Status === 1 ? `<a class='disable_menudd btn-xs bold' href='/about/status_change/${row.Id}/${row.Status}' id='${row.Id}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Disable</a>` : ''}
                        ${row.Status === 2 ? `<a class='enable_menu1 btn-xs bold' href='/about/status_change/${row.Id}/${row.Status}' id='${row.Id}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Enable</a>` : ''}
                        <a class='btn-xs bold delete_menu1'href='/about/status_change/${row.Id}/3' id='${row.Id}'>
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

// Async function to get category data and generate HTML
async function get_wall_menu_data(req, res) {
    let html = '';

    // Assuming you're using POST method to trigger this
    if (req.method === 'POST') {
        try {
            // Sequelize query to fetch all active categories ordered by PositionOrder
            const categories = await Category.findAll({
                where: { Status: 1 },
                order: [['PositionOrder', 'ASC']]
            });

            html += `
                <div class="row mt-3">
                    <div class="col-md-6">
                        <p class="mb-0 hamburger_para">Category Position List</p>
            `;

            if (categories.length > 0) {
                html += `<div class="hamurger_detail ham_dashboard_dt row_position">`;

                // Loop through each result and create HTML
                categories.forEach((category) => {
                    html += `
                        <div class="hamburger_content bg-white bd4 p-1 mt-3" id="${category.CategoryId}">
                            <p class="mb-0">${category.CategoryName}</p>
                        </div>
                    `;
                });

                html += `</div>`;
            } else {
                html += '<p>No data found</p>';
            }

            html += `
                    </div>
                </div>
            `;

            // Send the generated HTML as the response
            res.send(html);

        } catch (error) {
            console.error('Database query error:', error);
            res.send('<p>Error fetching data</p>');
        }
    } else {
        res.send('<p>Invalid request method</p>');
    }
};

// Async function to update the category positions
async function category_menu_position(req, res) {
    console.log(req.body);
    const { position } = req.body; // Destructure 'position' array from the POST request body
    let i = 1; // Start with position order 1

    try {
        for (const categoryId of position) {
            // Update each category's PositionOrder if Status is 1
            await Category.update(
                { PositionOrder: i },   // Update data (set new PositionOrder)
                { where: { CategoryId: categoryId, Status: 1 } } // Conditions (CategoryId and Status)
            );
            i++; // Increment the position order for the next category
        }

        res.json({ success: true, message: "Position updated successfully." });
    } catch (error) {
        console.error('Error updating positions:', error);
        res.status(500).json({ success: false, message: "Error updating positions." });
    }
}

async function dashboard_details_data(req, res) {
    try {
      const totalCategories = await Category.count();
      const totaluser = await User.count();
      res.json({
        data: {
          total_category : totalCategories,
          total_user : totaluser
        }
      });
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  async function edit_about(req, res) {
    try {
        const BlogId = req.params.id;
    
        const blog = await About.findOne({
            where: {
                Id: BlogId
            }
    });
    
        if (blog.length === 0) {
            return res.status(404).json({ message: 'About us not found' });
        }
        res.json(blog); // Return the single category
    } catch (error) {
        console.error('Error fetching About by ID:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}



async function updateAbout(req, res) {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ error: "Form parsing failed" });
            }

            const Id = fields.CategoryId ? fields.CategoryId[0] : null;
            const desciption = fields.desciption ? fields.desciption[0] : null;
            const Status = fields.Status ? fields.Status[0] : null;

           

            let updateData = {
                Description: desciption,
                Status: Status
            };

            
            const existingAbout = await About.findOne({ where: { Id: Id } });

            if (!existingAbout) {
                return res.status(404).json({ message: 'About us not found' });
            }

            await About.update(updateData, {
                where: { Id: Id }
            });

            return res.json({ message: 'About updated successfully' });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


async function status_change(req, res) {
    try {
        const Id = req.params.id;
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
        const [updated] = await About.update(
            { Status: newStatus },
            { where: { Id: Id } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'About not found or status unchanged' });
        }

        return res.redirect('/about_us');

    } catch (error) {
        console.error('Error updating About status:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}




module.exports = {
    addabout,
    get_all_about_ajax,
    get_wall_menu_data,
    category_menu_position,
    dashboard_details_data,
    edit_about,
    status_change,
    updateAbout
};
