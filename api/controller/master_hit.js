// services/authService.js
// const bcrypt = require('bcrypt');
// const Ticket_Raise = require('../models/RaiseTicketModel'); // Ensure Sequelize model is defined correctly
const  sequelize  = require('../models/connection'); // Export sequelize in connection.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
// const axios = require('axios');
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






 const axios = require('axios');

const kundliMatchHandler = async (req, res) => {
  const apiKey = "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";

const model = 'gpt-3.5-turbo'; // Often faster and cheaper


  const boyName = "deepak chauhan";
  const boyDob = "1997-11-15";
  const boyTob = "06:00 AM";
  const boyPob = "haryana";

  const girlName = "shreya Tandon";
  const girlDob = "1998-07-15";
  const girlTob = "07:37 AM";
  const girlPob = "bahraich";

  const promptText = `
You are a skilled Vedic astrologer.

Based on the birth details below, return a complete marriage compatibility report in valid JSON only.

Boy:
- Name: ${boyName}
- DOB: ${boyDob}
- TOB: ${boyTob}
- POB: ${boyPob}

Girl:
- Name: ${girlName}
- DOB: ${girlDob}
- TOB: ${girlTob}
- POB: ${girlPob}

Respond in this JSON format:

1. guna_milan: array of 8 objects with:
   - koot
   - focus_area
   - points (max)
   - matched (numerical, e.g., 0–8)
   - explanation (1–2 line astrological reason using rashi, nakshatra etc.)

2. total_score: "28 / 36"

3. compatibility_sections:
Write 2–3 sentence personalized insights for each of the following sections. Use astrological logic from the couple’s actual charts (Moon sign, Venus, Lagna, Mercury, 7th house, etc.), but keep it emotionally warm and easy to understand — like a caring astrologer giving a private reading. Don’t use generic descriptions; analyze their actual compatibility.

- love_relationship: Describe romantic chemistry, emotional harmony, physical passion, and long-term bonding.
- health: Talk about shared vitality, stress responses, immunity patterns, or any chronic health clashes from their charts.
- mental_compatibility: Show how their thinking, communication, and emotional responses align or differ.
- career: Explain whether their ambitions and professional attitudes align or conflict, and if they support each other’s success.


4. dosha_analysis:
   - boy_manglik_status
   - girl_manglik_status
   - impact

5. dosha_remedies:
   - nivaran_for_manglik
   - minor_chakra_doshas

6. summary:
   - overall_compatibility
   - strengths (3 bullets)
   - tips (3 bullets)

Rules:
- Use real astrological logic.
- Keep explanations short but informative.
- Only valid JSON. No markdown, no extra text.
`;


  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful astrologer.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.3,
        top_p: 0.85,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let reply = response.data.choices[0].message.content;
reply = reply.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(reply);
      res.json({
        status: true,
        message: 'Horoscope insights fetched successfully.',
        data: parsed
      });
    } catch (jsonErr) {
      res.status(500).json({
        status: false,
        message: 'JSON parsing error from GPT response.',
        raw: reply
      });
    }

  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch from OpenAI API.',
      error: error.message
    });
  }
};












module.exports =
 { 
  content,
  kundliMatchHandler


 };