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
// const Category = require('../models/Category');
const User = require('../models/User');



app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});





// async function userLisgt(req, res) {
//     console.log("bhefwvbfhjervhfevfr");
// }
const userList = (req, res) => {
    console.log("Inside userList controller");
    res.render('pages/usersManagement/users');
};






module.exports = {
    
    userList
   
};
