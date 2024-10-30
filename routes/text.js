const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Data = require('../models/Data'); // Import the Data model

const router = express.Router();

// ChatGPT API setup
const OPENAI_API_KEY = process.env.KESHAV_CHAT_API_KEY;
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

router.post('/input-text', auth, async (req, res) => {
  try {
    const jwtToken = req.headers.authorization?.split(' ')[1]; // Extract JWT
    const { inputText } = req.body;

    if (!jwtToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prepare the ChatGPT API request payload
    const chatRequestPayload = {
      model: 'gpt-4o', // Adjust model as needed
      messages: [{ role: 'user', content: inputText }],
    };

    // Send request to ChatGPT API
    const chatResponse = await axios.post(CHATGPT_API_URL, chatRequestPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    });

    const chatOutput = chatResponse.data.choices[0].message.content;

    // Find or create a user by JWT
    let data = await Data.findOne({ jwt: jwtToken });

    if (!data) {
      // If user doesn't exist, create a new one
      data = new Data({ jwt: jwtToken });
    }

    // Add the new interaction to the user's history
    data.history.push({ input: inputText, output: chatOutput });

    // Increment the user's question count
    data.questionCount += 1;

    // Save the user data to the database
    await data.save();

    // Prepare the response data
    const responseData = {
      jwt: jwtToken,
      input: inputText,
      output: chatOutput,
      questionCount: data.questionCount,
    };

    // Send the response back to the client
    res.json(responseData);
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
