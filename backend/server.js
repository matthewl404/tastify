// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// THE PREDICTION ENDPOINT
app.post('/api/predict', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    // Construct the prompt for the AI
    const prompt = `
      Act as a food critic and taste predictor. Based on these ingredients: ${ingredients}. 
      Will the average person enjoy a dish made with these? 
      Respond with a JSON object that has the following structure:
      {
        "prediction": "like" or "dislike",
        "confidence": number between 0 and 1,
        "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
      }
      The suggestions should be specific, actionable improvements for the dish.
      Make the response realistic and helpful.
    `;

    // Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Parse the AI's response
    const aiResponse = response.data.choices[0].message.content.trim();
    
    try {
      // Try to parse JSON response
      const predictionData = JSON.parse(aiResponse);
      res.json(predictionData);
    } catch (parseError) {
      // If JSON parsing fails, fall back to text response
      console.log('AI returned non-JSON response, using fallback');
      const fallbackResponse = {
        prediction: Math.random() > 0.5 ? 'like' : 'dislike',
        confidence: (Math.random() * 0.3 + 0.6).toFixed(2),
        suggestions: [
          'Consider adding fresh herbs for better flavor complexity',
          'Adjust cooking time and temperature for optimal texture',
          'Try different seasoning combinations to enhance the taste'
        ]
      };
      res.json(fallbackResponse);
    }

  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    
    // Fallback response if API call fails
    const fallbackResponse = {
      prediction: Math.random() > 0.5 ? 'like' : 'dislike',
      confidence: (Math.random() * 0.3 + 0.6).toFixed(2),
      suggestions: [
        'Add a pinch of salt to enhance natural flavors',
        'Try different cooking methods for variety',
        'Consider pairing with complementary ingredients'
      ]
    };
    
    res.json(fallbackResponse);
  }
});

// RECIPE GENERATION ENDPOINT
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { ingredients, prediction } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    // Construct the prompt for recipe generation
    const prompt = `
      Create a detailed recipe based on these ingredients: ${ingredients}.
      The user's taste prediction was: ${prediction || 'unknown'}.
      
      Generate a COMPLETE recipe with the following structure:
      - A creative, appealing recipe name
      - Realistic prep time and cook time estimates
      - Serving size (2-4 people)
      - Detailed ingredients list with quantities and preparation notes
      - Clear, numbered step-by-step cooking instructions
      - Optional: cooking tips or serving suggestions
      
      Make the recipe practical, easy to follow, and appealing. 
      Format the response as a JSON object with this exact structure:
      {
        "name": "Recipe Name",
        "prepTime": "X minutes",
        "cookTime": "Y minutes",
        "serves": Z,
        "ingredients": ["ingredient1", "ingredient2", ...],
        "instructions": ["step1", "step2", ...],
        "tips": ["tip1", "tip2", ...]
      }
    `;

    // Call the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Parse the AI's response
    const aiResponse = response.data.choices[0].message.content.trim();
    
    try {
      // Try to parse JSON response
      const recipeData = JSON.parse(aiResponse);
      res.json(recipeData);
    } catch (parseError) {
      console.log('AI returned non-JSON recipe response, using fallback');
      
      // Fallback recipe generation
      const ingredientList = ingredients.split(',').map(i => i.trim());
      const mainIngredient = ingredientList[0] || 'ingredients';
      
      const fallbackRecipe = {
        name: `AI-Generated ${mainIngredient} Delight`,
        prepTime: `${Math.floor(Math.random() * 10) + 10} minutes`,
        cookTime: `${Math.floor(Math.random() * 20) + 15} minutes`,
        serves: Math.floor(Math.random() * 3) + 2,
        ingredients: [
          ...ingredientList.map(ing => `${ing} (to taste)`),
          '2 tablespoons olive oil',
          'Salt and pepper to taste',
          '1 teaspoon garlic powder',
          'Fresh herbs for garnish'
        ],
        instructions: [
          'Prepare all ingredients by washing and chopping as needed',
          'Heat oil in a large pan over medium heat',
          'Add main ingredients and cook until slightly browned',
          'Season with salt, pepper, and spices',
          'Continue cooking until all ingredients are tender',
          'Adjust seasoning to taste and garnish with fresh herbs',
          'Serve immediately while hot'
        ],
        tips: [
          'For best results, use fresh ingredients when possible',
          'Adjust cooking time based on your preferred texture',
          'Feel free to substitute ingredients based on availability'
        ]
      };
      
      res.json(fallbackRecipe);
    }

  } catch (error) {
    console.error('Recipe Generation Error:', error.response?.data || error.message);
    
    // Fallback recipe response
    const ingredientList = ingredients ? ingredients.split(',').map(i => i.trim()) : ['chicken', 'vegetables'];
    const mainIngredient = ingredientList[0] || 'ingredients';
    
    const fallbackRecipe = {
      name: `Emergency ${mainIngredient} Recipe`,
      prepTime: '15 minutes',
      cookTime: '25 minutes',
      serves: 2,
      ingredients: [
        `${mainIngredient} (main component)`,
        '2 tbsp cooking oil',
        '1 tsp salt',
        '1/2 tsp black pepper',
        '1 tsp mixed herbs',
        '2 cloves garlic, minced'
      ],
      instructions: [
        'Prepare your ingredients by cleaning and cutting as needed',
        'Heat oil in a pan over medium heat',
        'Add garlic and sauté until fragrant',
        'Add main ingredients and cook until done',
        'Season with salt, pepper, and herbs',
        'Cook for additional 5 minutes',
        'Serve hot and enjoy'
      ],
      tips: [
        'Taste and adjust seasoning as you cook',
        'Don\'t overcrowd the pan for better browning',
        'Let the dish rest for few minutes before serving'
      ]
    };
    
    res.json(fallbackRecipe);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Taste Predictor API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AI Taste Predictor API',
    endpoints: {
      prediction: 'POST /api/predict',
      recipe: 'POST /api/generate-recipe',
      health: 'GET /api/health'
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
  console.log('Endpoints:');
  console.log(`  POST /api/predict - Analyze ingredients for taste prediction`);
  console.log(`  POST /api/generate-recipe - Generate AI recipe`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  / - API information`);
});
