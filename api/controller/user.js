// services/authService.js

 const bcrypt = require('bcrypt');
 const { v4: uuidv4 } = require('uuid');
 require('dotenv').config();
 const Razorpay = require('razorpay');

// const Ticket_Raise = require('../models/RaiseTicketModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Ticket_Raise = require('../models/TicketModel'); // Ensure Sequelize model is defined correctly
const User = require('../models/userModel'); // Ensure Sequelize model is defined correctly
const Order = require('../models/Order');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

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
    const { email, mobile, newPassword } = req.body;

    // Validate input
    if (!email && !mobile) {
      return res.status(400).json({
        status: false,
        message: 'Please provide either email or mobile number',
      });
    }

    if (!newPassword) {
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

const intitiate_order = async (req, res) => {
  try {
    const { user_id,plan_id, plan_name, total_amount,plan_validity } = req.body;

    // Basic validation
    if (!user_id || !plan_name ||  plan_name.length === 0 || !total_amount || !plan_id || !plan_validity) {
      return res.status(400).json({
        status: false,
        message: 'user_id, items, and total_amount are required',
      });
    }

      await sequelize.sync(); 


      const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(total_amount) * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`, // <= VALID RECEIPT STRING
      payment_capture: 1,
    });

   
    // Create order in DB
     const newOrder = await Order.create({
      user_id: user_id,
     order_id : '3DAstro_' + uuidv4(),
      plan_id: plan_id,
      plan_name: plan_name,
      total_amount: parseFloat(total_amount),
      plan_validity: plan_validity,
      pre_transaction_id: razorpayOrder.id, // <-- save Razorpay order ID
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

     return res.status(201).json({
      status: true,
      message: 'Order initiated successfully',
      order: newOrder,
      razorpay: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    });

  } catch (error) {
    console.error('Order initiation error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to initiate order',
      error: error.message
    });
  }
};

module.exports =
 { 
  raise_ticket,
  login,
  forgot_password,
  intitiate_order

 };