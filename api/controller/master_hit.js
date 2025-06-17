// services/authService.js
// const bcrypt = require('bcrypt');
// const Ticket_Raise = require('../models/RaiseTicketModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
// const Ticket_Raise = require('../models/TicketModel'); // Ensure Sequelize model is defined correctly
const Banner = require('../../models/Banner');
const Blog = require('../../models/blog');
const testimonial = require('../../models/testimonial');
const subscription = require('../../models/Subscription');
const about = require('../../models/about');
const support = require('../../models/help');


const content = async (req, res) => {
  try {
    // Example: Replace these with actual database calls
    const banners = await Banner.findAll({ where: { Status: 1 } });
    const blogs = await Blog.findAll({ where: { Status: 1 } });
    const testimonials = await testimonial.findAll({ where: { Status: 1 } });
    const subscriptions  = await subscription.findAll({ where :{ Status : 1 }});
    const abouts  = await about.findAll({ where :{ Status : 1 , type:1 }});
    const term  = await about.findAll({ where :{ Status : 1 , type:2 }});
    const policy  = await about.findAll({ where :{ Status : 1 , type:3 }});
    const supports = await support.findAll({ where :{ Status : 1}});
        if (
            (!banners || banners.length === 0) &&
            (!blogs || blogs.length === 0) &&
            (!subscriptions || subscriptions.length===0) &&
            (!testimonials || testimonials.length === 0)
            ) {
            return res.status(200).json({
                status: false,
                message: 'No data found',
            });
            }
    res.status(200).json({
      status: true,
      message: 'Home data fetched successfully',
      data: {
        banners,
        blogs,
        testimonials,
        subscriptions,
        abouts,
        term,
        policy,
        supports


        

      }
    });
  } catch (error) {
    console.error('Error in index:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};









module.exports =
 { 
  content


 };