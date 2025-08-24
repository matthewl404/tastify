// backend/server.js

// 1. Load environment variables from .env file
require('dotenv').config();

// 2. Import the packages we just installed
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// 3. Create an Express application
const app = express();
// Use the port from the environment variable (for Render) or default to 5000 for local testing
const port = process.env.PORT || 5000;

// 4. Apply middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to parse JSON data from requests

// 5. Define THE ONE route we need for the demo
app.post('/api/predict', async (req, res) => {
  // This try-catch block handles errors so our server doesn't crash
  try {
    // Get the ingredients from the request body sent by the frontend
    const { ingredients } = req.body;

    // Craft the prompt for the AI. This is the secret sauce.
    const prompt = `
      Act as a food critic and taste predictor. Based on these ingredients: ${ingredients}. 
      Will the average person enjoy a dish made with these? 
      Respond with a very short, fun, one-sentence prediction, maximum 10 words.
      Just give the prediction, no other text.
    `;

    // 6. Make the request to the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // The OpenAI API endpoint
      {
        model: 'gpt-3.5-turbo', // The model we want to use
        messages: [{ role: 'user', content: prompt }], // The prompt for the model
        max_tokens: 30, // Limits the length of the response to keep it cheap
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use the hidden API key
          'Content-Type': 'application/json',
        },
      }
    );

    // 7. Extract the AI's text response from the OpenAI API's complex reply
    const prediction = response.data.choices[0].message.content.trim();

    // 8. Send the prediction back to the frontend as JSON
    res.json({ prediction });

  } catch (error) {
    // 9. If anything goes wrong, log the error and send a friendly message
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get a prediction. Are you sure you added your API key?' });
  }
});

// 10. Start the server and make it listen for requests
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});

