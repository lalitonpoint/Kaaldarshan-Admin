// services/authService.js
 const bcrypt = require('bcrypt');
// const Ticket_Raise = require('../models/RaiseTicketModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Ticket_Raise = require('../models/TicketModel'); // Ensure Sequelize model is defined correctly
const User = require('../models/userModel'); // Ensure Sequelize model is defined correctly


const raise_ticket = async (req, res) => {
  try {
      
    const { user_query, user_id } = req.body;
       await sequelize.sync(); 

     if (!user_query) {
      return res.status(400).json({status :false , message: 'User Query  are required' });
    }
    if(!user_id){
             return res.status(400).json({status :false , message: ' User Id are required' });
 
    }

     const newTicket = await Ticket_Raise.create({
      user_id,
      user_query,
      sender : "user",
      Query_status: 1, 
      status :1,
      created_at: new Date(),
      modified_time: new Date()
    });

    return res.status(201).json({
      message: 'Ticket raised successfully',
      ticket: newTicket
    });
  } 
  
  catch (error) {
    console.error("Error raising ticket:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // 1. Check if both fields are provided
    if (!mobile || !password) {
      return res.status(400).json({
        status: false,
        message: 'Mobile and password are required',
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ where: { mobile } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Mobile number not found',
      });
    }

    // 3. Match password (plain-text check, or use bcrypt if hashed)
    if (user.password !== password) {
      return res.status(401).json({
        status: false,
        message: 'Incorrect password',
      });
    }

    // 4. Create JWT token
    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    // 5. Return success response
    return res.status(200).json({
      status: true,
      message: 'Login successful',
      Jwt: token,
      user: user, // optionally omit password in real apps
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong during login',
    });
  }
};


const forgot_password = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    // Validate input
    if (!email && !mobile) {
      return res.status(400).json({
        status: false,
        message: 'Please provide either email or mobile number',
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: 'New password is required',
      });
    }

    // Find the user by email or mobile
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email || null },
          { mobile: mobile || null }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found with given email or mobile number',
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
   await User.update(
  { password: hashedPassword },
  {
    where: {
      [Op.or]: [
        { email: email || null },
        { mobile: mobile || null }
      ]
    }
  }
);

    return res.status(200).json({
      status: true,
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong during password reset',
    });
  }
};





module.exports =
 { 
  raise_ticket,
  login,
  forgot_password

 };