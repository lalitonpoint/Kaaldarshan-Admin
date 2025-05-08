// services/authService.js
// const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');


const signup = async (req, res) => {
  try {
      
      await sequelize.sync(); 
      const {name,email,mobile, password } = req.body; 
      let missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!mobile) missingFields.push('mobile');
      if (!password) missingFields.push('password');
      if (missingFields.length > 0) {
        return res.status(400).json({
          status: false,
          message: `The following fields are required: ${missingFields.join(', ')}`
         
        });
      }
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { mobile: mobile }
          ]
        }
      });
      if (existingUser) {
        return res.status(400).json({
          Status: false,
          message: 'Email or mobile already exists'
        });
      }

    const newUser = await User.create({
      name : String(name),
      email : String(email),
      mobile: String(mobile),
      password: String(password),
      
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email }, // Payload
      process.env.SECRET_KEY, // Secret key for signing the JWT
      { expiresIn: '1h' } // Set the expiration time for the token
    );
    res.status(200).json({
      status: true,
      message: 'User registered successfully',
      data: newUser,
      Jwt : token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: false,
      message: 'Registration failed',
    });
  }
};



module.exports = { signup };