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
const User = require('../models/User');


// Define associations
User.hasMany(Category, { foreignKey: 'TrnBy', sourceKey: 'id', as: 'categories' }); // User can have many categories
Category.belongsTo(User, { foreignKey: 'TrnBy', targetKey: 'id', as: 'user' }); // Category belongs to User

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

// Function to handle category addition
// const addCategory = [
//     upload.single('CategoryThumb'), // File upload middleware
//     (req, res) => {
//         // Handle validation errors from express-validator
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ status: false, message: errors.array() });
//         }

//         // Check for user session and handle errors
//         if (!req.session || !req.session.user || !req.session.user.id) {
//             return res.status(400).json({ status: false, message: 'User session is missing or invalid' });
//         }

//         // Log the request body and other request data for debugging
//         console.log('Request Body:', req.body);
//         console.log('Request File:', req.file);

//         // Extract the necessary data from the request
//         const { CategoryName } = req.body;
//         const file = req.file;

//         // Ensure the thumbnail file is uploaded
//         if (!file) {
//             return res.status(400).json({ status: false, message: 'Thumbnail is required' });
//         }

//         const imagePath = `uploads/${file.filename}`; // Path to store the image
//         const user_id = req.session.user.id;          // Get user ID from session
//         const currentDate = new Date();               // Get the current date

//         // Insert the data into the database
//         console.log('Inserting category:', CategoryName);

//         console.log('Preparing to insert category:', { CategoryName, imagePath, currentDate, user_id });
//         try {
//             db.query(
//                 'INSERT INTO Category (CategoryName, CategoryThumb, TrnOn, TrnBy) VALUES (?, ?, ?, ?)',
//                 [CategoryName, imagePath, currentDate, user_id],
//                 (err, result) => {
//                     console.log('After executing the query'); // This will confirm whether the callback is executed
//                     if (err) {
//                         console.error('Database error:', err);
//                         return res.status(500).json({ status: false, message: 'Database error occurred while inserting category' });
//                     }

//                     // Check if the insert operation affected any rows
//                     if (result && result.affectedRows > 0) {
//                         console.log('DB Query Result:', result);  // Log result of the query
//                         console.log('Category inserted successfully');
//                         return res.status(200).json({ status: true, message: 'Category added successfully!' });
//                     } else {
//                         console.error('No rows affected or unexpected result:', result);
//                         return res.status(500).json({ status: false, message: 'Category insertion failed.' });
//                     }
//                 }
//             );
//         } catch (err){
//             console.log(err);
//         }
//         return res.status(200).json({ status: true, message: 'Category added successfully!' });
//     }
// ];


 // Adjust the path as needed

const addCategory = [
    upload.single('CategoryThumb'), // File upload middleware
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

        // Log the request body and other request data for debugging
        console.log('Request Body:', req.body);
        // console.log('Request File:', req.file);

        // Extract the necessary data from the request
        const { CategoryName,Status } = req.body;
        const file = req.file;

        // Ensure the thumbnail file is uploaded
        if (!file) {
            return res.status(400).json({ status: false, message: 'Thumbnail is required' });
        }

        const imagePath = `uploads/${file.filename}`; // Path to store the image
        const user_id = req.session.user.id;          // Get user ID from session
        const currentDate = new Date();               // Get the current date

        try {
            // Insert the data into the database using Sequelize
            const category = await Category.create({
                CategoryName,
                CategoryThumb: imagePath,
                TrnOn: currentDate,
                TrnBy: user_id,
                Status : Status
            });

            console.log('Category inserted successfully:', category);
            return res.status(200).json({ status: true, message: 'Category added successfully!' });
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ status: false, message: 'Database error occurred while inserting category' });
        }
    }
];

// Function to get all categories with DataTables
// async function get_all_category_ajax(req, res) {
//     const requestData = req.body || {}; // Ensure requestData is defined

//     // Safely access properties with defaults
//     const start = parseInt(requestData.start) || 0; // Default to 0
//     const length = parseInt(requestData.length) || 10; // Default to 10

//     try {
//         // Get total count of records
//         let [totalQuery] = await db.query('SELECT COUNT(CategoryId) as total FROM Category WHERE Status != 3');
//         let totalData = totalQuery[0].total;

//         // Main query with search and filtering logic
//         let sql = `
//             SELECT Category.*, ua.name 
//             FROM Category 
//             LEFT JOIN users as ua ON ua.id = Category.TrnBy
//             WHERE Category.Status != 3
//         `;

//         // Clone query to get the total filtered count
//         let totalFilteredQuery = await db.query(sql);
//         let totalFiltered = totalFilteredQuery[0].length;

//         // Add ordering and pagination
//         sql += ` ORDER BY CategoryId DESC LIMIT ?, ? `;

//         let [results] = await db.query(sql, [start, length]); // Make sure to pass start and length as parameters

//         // Format the data for DataTables
//         let data = results.map(row => {
//             return [
//                 row.CategoryName, // Column 1
//                 `<img width="120" height="50" src="${row.CategoryThumb}">`, // Column 2
//                 row.name || row.TrnBy, // Column 3 (use TrnBy if name is not available)
//                 row.TrnOn, // Column 4
//                 row.Status == 2
//                     ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>`
//                     : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span>Enabled</span>`, // Column 5
//                 `<div class='dropdown show'>
//                     <button class='btn dropdown-toggle bd4' data-bs-toggle='dropdown'>
//                         <i class='fa fa-ellipsis-v '></i>
//                     </button>
//                     <ul class='dropdown-menu'>
//                         <a class='view_data_chk btn-xs bold' href='/Category/edit_category/${row.CategoryId}'>
//                             <i class='fa fa-pencil' aria-hidden='true'></i> Edit</a>
//                         ${row.Status == 1 ? `<a class='disable_menu btn-xs bold' href='javascript:void(0)' id='${row.CategoryId}'>
//                             <i class='fa fa-ban' aria-hidden='true'></i> Disable</a>` : ''}
//                         ${row.Status == 2 ? `<a class='enable_menu btn-xs bold' href='javascript:void(0)' id='${row.CategoryId}'>
//                             <i class='fa fa-ban' aria-hidden='true'></i> Enable</a>` : ''}
//                         <a class='btn-xs bold delete_menu' href='javascript:void(0)' id='${row.CategoryId}'>
//                             <i class='fa fa-trash' aria-hidden='true'></i> Delete</a>
//                     </ul>
//                 </div>` // Column 6 (action buttons)
//             ];
//         });

//         // Return JSON response
//         res.json({
//             draw: 1, // Provide default draw value
//             recordsTotal: totalData,
//             recordsFiltered: totalFiltered,
//             data: data // Ensure 'data' is an array of arrays
//         });

//     } catch (err) {
//         console.error('Database error:', err);
//         res.status(500).json({
//             status: false,
//             message: 'Database error occurred.'
//         });
//     }
// }

async function get_all_category_ajax(req, res) {
    const requestData = req.body || {}; // Ensure requestData is defined
    console.log('requested data', req.body);

    // Safely access properties with defaults
    const start = parseInt(requestData.start) || 0; // Default to 0
    const length = parseInt(requestData.length) || 10; // Default to 10

    try {
        // Get total count of records
        const totalCount = await Category.count({
            where: { Status: { [Op.ne]: 3 } }
        });

        const searchValue = requestData.search?.value || '';
        const whereClause = {
            Status: { [Op.ne]: 3 }
        };

        if (searchValue) {
            whereClause.CategoryName = {
                [Op.like]: `%${searchValue}%`
            };
        }

        // Get filtered count using the whereClause
        const filteredCount = await Category.count({ where: whereClause });

        // Get filtered data
        const categories = await Category.findAll({
            where: whereClause, // Use the whereClause for filtering
            include: [{ model: User, as: 'user', attributes: ['name'] }], // Assuming you have a User model
            order: [['CategoryId', 'DESC']],
            offset: start,
            limit: length,
        });

        // Format the data for DataTables
        const data = categories.map(row => {
            return [
                row.CategoryId,
                row.CategoryName, // Column 1
                `<img width="80" height="50" src="${row.CategoryThumb}">`, // Column 2
                row.user?.name || row.TrnBy, // Column 3 (use TrnBy if name is not available)
                row.TrnOn, // Column 4
                row.Status === 2
                    ? `<span class="disabled_detail"><span class="disabled_td mr-1"><i class="fa fa-times-circle" aria-hidden="true"></i></span> Disabled</span>`
                    : `<span class="enabled_detail"><span class="enabled_td me-1"><i class="fa fa-clock-o"></i></span>Enabled</span>`, // Column 5
                `
                        <a class='view_data_chk btn-xs bold' href='/Category/edit_category/${row.CategoryId}'>
                            <i class='fa fa-pencil' aria-hidden='true'></i> Edit</a>
                        ${row.Status === 1 ? `<a class='disable_menudd btn-xs bold' href='/Category/status_change/${row.CategoryId}/${row.Status}' id='${row.CategoryId}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Disable</a>` : ''}
                        ${row.Status === 2 ? `<a class='enable_menu1 btn-xs bold' href='/Category/status_change/${row.CategoryId}/${row.Status}' id='${row.CategoryId}'>
                            <i class='fa fa-ban' aria-hidden='true'></i> Enable</a>` : ''}
                        <a class='btn-xs bold delete_menu1'href='/Category/status_change/${row.CategoryId}/3' id='${row.CategoryId}'>
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

  async function edit_category(req, res) {
    try {
        const categoryId = req.params.id;
    
        const category = await Category.findOne({
            where: {
                CategoryId: categoryId
            }
    });
    
        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category); // Return the single category
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}



async function updateCategory(req, res) {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ error: "Form parsing failed" });
            }

            const categoryId = req.params.CategoryId;
            const categoryName = fields.CategoryName ? fields.CategoryName[0] : null;
            const thumbFile = files.CategoryThumb ? files.CategoryThumb[0] : null;
            const Status = fields.Status ? fields.Status : null;

            if (!categoryName) {
                return res.status(400).json({ message: 'Category Name is required' });
            }

            if (!thumbFile) {
                return res.status(400).json({ message: 'thumbFile Name is required' });
            }

            let updateData = {
                CategoryName: categoryName,
                Status : Status
            };

            // Handle file upload
            if (thumbFile) {
                const tempPath = thumbFile.path;
                const extension = path.extname(thumbFile.originalFilename);
                const fileName = `${Date.now()}${extension}`;
                const uploadPath = path.join(__dirname, '../uploads', fileName); // Adjust path as needed

                fs.rename(tempPath, uploadPath, async (err) => {
                    if (err) {
                        console.error("Error saving file:", err);
                        return res.status(500).json({ message: 'File saving failed' });
                    }

                    updateData.CategoryThumb = `uploads/${fileName}`;

                    // Perform the database update after file move
                    const [updated] = await Category.update(updateData, {
                        where: { CategoryId: categoryId }
                    });

                    if (updated === 0) {
                        return res.status(404).json({ message: 'Category not found or no change made' });
                    }

                    res.json({ message: 'Category updated successfully' });
                });
            } else {
                // If no image was uploaded, just update the name
                const [updated] = await Category.update(updateData, {
                    where: { CategoryId: categoryId }
                });

                if (updated === 0) {
                    return res.status(404).json({ message: 'Category not found or no change made' });
                }

                res.json({ message: 'Category updated successfully' });
            }
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function status_change(req, res) {
    try {
        const categoryId = req.params.id;
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
        const [updated] = await Category.update(
            { Status: newStatus },
            { where: { CategoryId: categoryId } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: 'Category not found or status unchanged' });
        }

        return res.redirect('/Category');

    } catch (error) {
        console.error('Error updating category status:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}




module.exports = {
    addCategory,
    get_all_category_ajax,
    get_wall_menu_data,
    category_menu_position,
    dashboard_details_data,
    edit_category,
    status_change,
    updateCategory
};
