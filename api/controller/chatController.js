const { body, validationResult } = require('express-validator');
const multer = require('multer');
const multiparty = require('multiparty');  // Require multiparty
const fs = require('fs');

const path = require('path');
const { DataTypes } = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../../connection');
//const db = require('../connection').promise();
const express = require('express');
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data
const Blog = require('../../models/blog');
const About = require('../../models/about');




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

// controllers/chatController.js
const twilio = require('twilio');
const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const xmlbuilder = require('xmlbuilder');

require('dotenv').config();
const twilioSid = process.env.twilioSid;;
const twilioToken = process.env.twilioToken;
const twilioNumber = process.env.twilioNumber; // Default Twilio number if not set

const awsKey = process.env.awsKey;;
const awsSecret = process.env.awsSecret;
const awsRegion = process.env.awsRegion; // Default region if not set
const agentId = process.env.agentId; // Your Bedrock agent ID
const aliasId = process.env.aliasId; // Your Bedrock agent alias ID

const baseUrl = 'https://c7befa9349d5.ngrok-free.app/api/chat'; // 👈 update to your deployed public endpoint
// At top of chatController.js


// === Function: Trigger call ===
const content = async (req, res) => {
  try {
    const number = req.body.number;
    const client = twilio(twilioSid, twilioToken);

    const call = await client.calls.create({
      to: number,
      from: twilioNumber,
      url: `${baseUrl}/start`,
      method: 'POST'
    });

    res.send(`✅ Call initiated to ${number}`);
  } catch (error) {
    console.error('❌ Error starting call:', error);
    res.status(500).send('Call failed');
  }
};

// === Function: Start TwiML ===
const start = (req, res) => {
  const xml = xmlbuilder.create('Response');
  xml.ele('Say', {
    voice: 'Polly.Aditi',
    language: 'hi-IN'
  }).text('नमस्ते, मैं Appsquadz से दीपक की बंदी बोल रही हूँ । आपकी ईएमआई ड्यू है, मैंने सोचा बात कर लूँ। आप अभी फ्री हैं?');

  xml.ele('Gather', {
    input: 'speech',
    action: `${baseUrl}/speech`,
    method: 'POST',
    timeout: 2, // ⏱ Reduced to 2 seconds
    language: 'en-IN',
    bargeIn: true // 👂 Optional: for interrupting
  }).ele('Say').text("I'm listening");

  xml.ele('Say').text('Sorry, I did not catch that.');

  res.type('text/xml').send(xml.end({ pretty: true }));
};


const speech = async (req, res) => {
  console.log('🎙️ SpeechResult:', req.body.SpeechResult);

  const inputText = req.body.SpeechResult || 'Hello';
console.log('🎙️ SpeechResuhjbdhjwbhjfwebrlt:', inputText);

  const bedrock = new BedrockAgentRuntimeClient({
    region: awsRegion,
    credentials: {
      accessKeyId: awsKey,
      secretAccessKey: awsSecret
    }
  });

  let reply = 'Sorry, I could not understand.';

  try {
    const command = new InvokeAgentCommand({
      agentId,
      agentAliasId: aliasId,
      sessionId: 'session_1211',
      inputText
    });

    const response = await bedrock.send(command);

    // If streaming, iterate through .completion
    if (response.completion) {
      reply = '';
      for await (const event of response.completion) {
        if (event.chunk?.bytes) {
          reply += new TextDecoder().decode(event.chunk.bytes);
        }
      }
    }
  } catch (err) {
    console.error('❌ Bedrock error:', err);
  }

  const xml = xmlbuilder.create('Response');
  xml.ele('Say', { voice: 'Polly.Aditi', language: 'en-IN' }).text(reply);
  xml.ele('Gather', {
    input: 'speech',
    action: `${baseUrl}/speech`,
    method: 'POST',
    timeout: 5,
    language: 'en-IN'
  });

  res.type('text/xml').send(xml.end({ pretty: true }));
};


module.exports = {
  content,
  start,
  speech
};



