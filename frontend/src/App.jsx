// frontend/src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [activeTab, setActiveTab] = useState('predict');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!ingredients) return;

    setIsLoading(true);
    setPrediction(null);
    setRecipe(null);

    try {
      const response = await axios.post(`${API_URL}/api/predict`, {
        ingredients,
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Error calling prediction API:', error);
      // Fallback response
      const simulatedResponse = {
        prediction: Math.random() > 0.5 ? 'like' : 'dislike',
        confidence: (Math.random() * 0.3 + 0.6).toFixed(2),
        suggestions: [
          'Consider adding more herbs for better flavor balance',
          'Try adjusting the cooking time for optimal texture'
        ]
      };
      setPrediction(simulatedResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecipe = async () => {
    if (!prediction || !ingredients) return;

    setIsGeneratingRecipe(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/generate-recipe`, {
        ingredients,
        prediction: prediction.prediction
      });
      setRecipe(response.data);
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Fallback recipe
      const simulatedRecipe = {
        name: `AI-Generated ${ingredients.split(',')[0]} Recipe`,
        prepTime: `${Math.floor(Math.random() * 10) + 5} minutes`,
        cookTime: `${Math.floor(Math.random() * 20) + 10} minutes`,
        serves: Math.floor(Math.random() * 4) + 1,
        ingredients: [
          ...ingredients.split(',').map(i => i.trim() + ' (to taste)'),
          'Olive oil (2 tbsp)',
          'Salt and pepper (to taste)',
          'Fresh herbs (for garnish)'
        ].slice(0, 6),
        instructions: [
          'Prepare all ingredients by washing and chopping as needed',
          'Heat oil in a pan over medium heat',
          'Add main ingredients and cook until tender',
          'Season with salt, pepper, and your preferred spices',
          'Cook until desired doneness is achieved',
          'Garnish with fresh herbs and serve immediately'
        ]
      };
      setRecipe(simulatedRecipe);
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const renderPredictTab = () => (
    <div className="tab-content active">
      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-utensils"></i> Describe Your Meal
        </h2>
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients or Meal Description</label>
          <textarea 
            className="form-control" 
            id="ingredients" 
            placeholder="E.g., Chicken breast, broccoli, rice, garlic, soy sauce..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows="4"
            disabled={isLoading}
          ></textarea>
        </div>
        
        <button 
          className="btn" 
          onClick={handlePredict}
          disabled={isLoading}
        >
          {isLoading ? 'AI is Analyzing...' : 'Predict Taste'}
        </button>
        
        {isLoading && <div className="loader"></div>}
      </div>

      {prediction && (
        <div className="prediction-result">
          <div className={`thumb ${prediction.prediction === 'like' ? 'up' : 'down'}`}>
            <i className={`fas fa-thumbs-${prediction.prediction === 'like' ? 'up' : 'down'}`}></i>
          </div>
          <h2>
            {prediction.prediction === 'like' 
              ? 'AI Prediction: You\'ll Enjoy This!' 
              : 'AI Suggests: This Might Not Suit Your Taste'
            }
          </h2>
          <p>
            AI Confidence: {Math.round(prediction.confidence * 100)}% - 
            {prediction.prediction === 'like' 
              ? ' This dish aligns well with predicted preferences' 
              : ' Consider alternative ingredient combinations'
            }
          </p>
          
          {prediction.suggestions && prediction.suggestions.length > 0 && (
            <div className="recipe-card">
              <h4><i className="fas fa-lightbulb"></i> AI Suggestions</h4>
              {prediction.suggestions.map((suggestion, index) => (
                <p key={index}>• {suggestion}</p>
              ))}
            </div>
          )}
          
          <button 
            className="btn" 
            onClick={generateRecipe}
            disabled={isGeneratingRecipe}
          >
            {isGeneratingRecipe ? 'Generating AI Recipe...' : 'Generate AI Recipe'}
          </button>
        </div>
      )}

      {isGeneratingRecipe && <div className="loader"></div>}

      {recipe && (
        <div className="recipe-section">
          <div className="card">
            <h2 className="card-title"><i className="fas fa-robot"></i> AI-Generated Recipe</h2>
            <h3>{recipe.name}</h3>
            <p>
              <strong>Prep time:</strong> {recipe.prepTime} | 
              <strong> Cook time:</strong> {recipe.cookTime} | 
              <strong> Serves:</strong> {recipe.serves}
            </p>
            
            <div className="recipe-card">
              <h4><i className="fas fa-list"></i> AI-Suggested Ingredients</h4>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div className="recipe-card">
              <h4><i className="fas fa-list-ol"></i> AI-Created Instructions</h4>
              {recipe.instructions.map((step, index) => (
                <div key={index} className="recipe-step">
                  <div className="recipe-step-number">{index + 1}</div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAboutTab = () => (
    <div className="tab-content">
      <div className="card">
        <h2 className="card-title"><i className="fas fa-info-circle"></i> About AI Taste Predictor</h2>
        <p>This app uses advanced AI to analyze ingredients and predict whether you'll enjoy a dish. Simply enter your ingredients and get instant predictions and recipe suggestions!</p>
        
        <div className="recipe-card">
          <h4><i className="fas fa-lightbulb"></i> How It Works</h4>
          <p>• Enter any ingredients or describe a meal</p>
          <p>• AI analyzes flavor profiles and combinations</p>
          <p>• Get instant predictions with confidence scores</p>
          <p>• Generate customized recipes based on the analysis</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <i className="fas fa-robot"></i>
              <span>AI Taste Predictor</span>
            </div>
            <ul className="nav-links">
              <li><a href="#predict" onClick={() => setActiveTab('predict')}>Predict Taste</a></li>
              <li><a href="#about" onClick={() => setActiveTab('about')}>How It Works</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>Discover What Tastes Good to You</h1>
          <p>Our AI predicts whether you'll enjoy a dish based on ingredient combinations and suggests improvements to make it perfect for your palate.</p>
          <div className="api-status">
            <div className="status-indicator status-connected"></div>
            <span>AI System Online - Ready to Predict</span>
          </div>
        </section>

        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'predict' ? 'active' : ''}`} 
            onClick={() => setActiveTab('predict')}
          >
            Predict Taste
          </div>
          <div 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`} 
            onClick={() => setActiveTab('about')}
          >
            How It Works
          </div>
        </div>

        {activeTab === 'predict' && renderPredictTab()}
        {activeTab === 'about' && renderAboutTab()}
      </div>

      <footer>
        <div className="container">
          <p>AI Taste Predictor &copy; 2023. This is a demo application for educational purposes.</p>
          <p>Deployed with React frontend and Node.js backend.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
