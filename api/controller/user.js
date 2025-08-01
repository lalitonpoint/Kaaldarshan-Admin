// services/authService.js

 const bcrypt = require('bcrypt');
 const { v4: uuidv4 } = require('uuid');
 require('dotenv').config();
 const Razorpay = require('razorpay');
const axios = require('axios');
// const Ticket_Raise = require('../models/RaiseTicketModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const Ticket_Raise = require('../models/TicketModel'); // Ensure Sequelize model is defined correctly
const User = require('../models/userModel'); // Ensure Sequelize model is defined correctly
const Order = require('../models/Order');
const ApiHit  =  require('../models/apiHit');
const ApiData = require('../models/apiData');
const api_key = process.env.API_KEY_VEDIC;
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
    const { user_id,plan_id, plan_name, total_amount,plan_validity,api_hits } = req.body;

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
      api_hits: api_hits,
      pre_transaction_id: razorpayOrder.id, // <-- save Razorpay order ID
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

     return res.status(201).json({
      status: true,
      message: 'Order initiated successfully',
      // order: newOrder,
      razorpay: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    });

  } catch (error) {
    // console.error('Order initiation error:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to initiate order',
      error: error.message
    });
  }
};

const model_data = async (req, res) => {
  try {
    const { dob, tob, selectedLanguage } = req.body;

    // Basic validation (optional but recommended)
    if (!dob || !tob || !selectedLanguage) {
      return res.status(400).json({
        status: false,
        message: 'dob, tob, and selectedLanguage are required'
      });
    }

    const apiPayload = {
      api_key: api_key,
      dob: dob,             // Format: "07/06/2028"
      tob: tob,             // Format: "11:38"
      lat: '1',
      lon: '1',
      tz: 5.5,
      lang: selectedLanguage
    };

    const response = await axios.get(
      'https://api.vedicastroapi.com/v3-json/horoscope/planet-details',
      { params: apiPayload }
    );

 
    await sequelize.sync();
    const existing = await ApiData.findOne({ order: [['id', 'ASC']] });
    const remainingCalls = response.data?.remaining_api_calls || 0;

        if (existing) {
      // Row exists → update it
      await existing.update({
        remaining_api_calls: remainingCalls,
        called_at: new Date()
      });
    } else {
      // No entry yet → create one
      await ApiData.create({
        remaining_api_calls: remainingCalls,
        called_at: new Date()
      });
    }

    // Send API response back to client
    return res.status(200).json({
      status: true,
      message: 'API data fetched successfully',
      data: response.data
    });

  } catch (error) {
    console.error('API call error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch data from external API',
      error: error.message
    });
  }
};


const user_api_call = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    // Get completed order with api_hits
    const orders = await Order.findAll({
      where: {
        user_id,
        status: 'completed'
      }
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this user' });
    }
      await sequelize.sync();

    // Get API hits value from first completed order (or loop if needed)
    const apiHitsFromOrder = orders[0].api_hits || 0;

    // Find existing api_hits record
    let hitRecord = await ApiHit.findOne({ where: { user_id } });

    if (hitRecord) {
      // Check if user has remaining hits
      if (hitRecord.hits_used >= hitRecord.max_hits) {
        return res.status(403).json({ success: false, message: 'API hit limit reached' });
      }

      // Increment hits_used
      await hitRecord.increment('hits_used', { by: 1 });
    } else {
      // Create new record with max_hits from order
      await ApiHit.create({
        user_id,
        max_hits: apiHitsFromOrder,
        hits_used: 0
      });
    }
    const remaining_hits = hitRecord.max_hits - hitRecord.hits_used;


    // ✅ Return the original order response
    return res.status(200).json({ status:true,message: 'Records Data Found',data: { max_hits: hitRecord.max_hits,hits_used: hitRecord.hits_used,remaining_hits
  }
});

  } catch (error) {
    console.error('Error processing API hit:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports =
 { 
  raise_ticket,
  login,
  forgot_password,
  intitiate_order,
  user_api_call,
  model_data

 };