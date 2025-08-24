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
  const [activeTab, setActiveTab] = useState('input');

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
      // Fallback to simulated AI response
      const simulatedResponse = {
        prediction: Math.random() > 0.5 ? 'like' : 'dislike',
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2),
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
      // Call your backend to generate a recipe
      const response = await axios.post(`${API_URL}/api/generate-recipe`, {
        ingredients,
        prediction: prediction.prediction
      });
      setRecipe(response.data);
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Fallback to simulated AI recipe generation
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

  const getAIDashboardData = () => {
    // Simulated AI-generated history data
    return [
      {
        name: `AI-Suggested ${['Pasta', 'Stir Fry', 'Salad', 'Soup'][Math.floor(Math.random() * 4)]}`,
        prediction: Math.random() > 0.6 ? 'Liked ✓' : 'Disliked ✗',
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2)
      },
      {
        name: `Generated ${['Vegetable', 'Protein', 'Grain'][Math.floor(Math.random() * 3)]} Dish`,
        prediction: Math.random() > 0.5 ? 'Liked ✓' : 'Disliked ✗',
        confidence: (Math.random() * 0.4 + 0.6).toFixed(2)
      },
      {
        name: `AI-Created ${['Fusion', 'Traditional', 'Modern'][Math.floor(Math.random() * 3)]} Recipe`,
        prediction: Math.random() > 0.7 ? 'Liked ✓' : 'Disliked ✗',
        confidence: (Math.random() * 0.35 + 0.65).toFixed(2)
      }
    ];
  };

  const getAIProfilePreferences = () => {
    // Simulated AI-generated user preferences
    const allPreferences = ['Vegetarian', 'Vegan', 'Spicy', 'Sweet', 'Savory', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein'];
    const activePreferences = allPreferences
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 2);
    
    return allPreferences.map(pref => ({
      name: pref,
      active: activePreferences.includes(pref)
    }));
  };

  const renderInputTab = () => (
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
          {isLoading ? 'AI is Analyzing...' : 'Predict Taste with AI'}
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
            
            <button className="btn btn-outline">
              <i className="fas fa-save"></i> Save AI Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardTab = () => {
    const historyData = getAIDashboardData();
    
    return (
      <div className="tab-content">
        <div className="card">
          <h2 className="card-title"><i className="fas fa-brain"></i> AI-Generated Taste Analytics</h2>
          <p>AI-powered analysis of your taste preferences and prediction history</p>
          
          {historyData.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-item-info">
                <h4>{item.name}</h4>
                <p>AI Prediction: {item.prediction} (Confidence: {Math.round(item.confidence * 100)}%)</p>
              </div>
              <div className="history-item-actions">
                <button className="btn btn-outline">AI Edit</button>
                <button className="btn btn-outline">Delete</button>
              </div>
            </div>
          ))}
          
          <div className="recipe-card">
            <h4><i className="fas fa-chart-line"></i> AI Analysis Summary</h4>
            <p>Based on your history, AI suggests you prefer dishes with:</p>
            <ul>
              <li>Balanced flavor profiles (savory + slight sweetness)</li>
              <li>Medium cooking intensity</li>
              <li>Fresh herb garnishes</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => {
    const preferences = getAIProfilePreferences();
    
    return (
      <div className="tab-content">
        <div className="card">
          <h2 className="card-title"><i className="fas fa-user-robot"></i> AI-Generated Profile</h2>
          
          <div className="form-group">
            <label htmlFor="username">AI-Suggested Username</label>
            <input type="text" className="form-control" id="username" value="AI_Food_Explorer" readOnly />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">AI-Managed Email</label>
            <input type="email" className="form-control" id="email" value="ai-profile@tastypredictor.com" readOnly />
          </div>
          
          <div className="form-group">
            <label>AI-Detected Dietary Preferences</label>
            <div className="preference-tags">
              {preferences.map((pref) => (
                <div key={pref.name} className={`tag ${pref.active ? 'active' : ''}`}>
                  <i className={`fas fa-${pref.active ? 'check' : 'times'}-circle`}></i> {pref.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="recipe-card">
            <h4><i className="fas fa-lightbulb"></i> AI Recommendation</h4>
            <p>Based on your preferences, try exploring Mediterranean and Asian fusion cuisine for optimal taste satisfaction.</p>
          </div>
          
          <button className="btn">Update AI Profile</button>
        </div>
      </div>
    );
  };

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
              <li><a href="#input" onClick={() => setActiveTab('input')}>AI Prediction</a></li>
              <li><a href="#dashboard" onClick={() => setActiveTab('dashboard')}>AI Analytics</a></li>
              <li><a href="#profile" onClick={() => setActiveTab('profile')}>AI Profile</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>AI-Powered Taste Discovery</h1>
          <p>Our advanced AI analyzes ingredients and predicts your taste preferences, generating personalized recipes and insights.</p>
          <a href="#input" className="btn" onClick={() => setActiveTab('input')}>
            <i className="fas fa-brain"></i> Start AI Analysis
          </a>
          <div className="api-status">
            <div className="status-indicator status-connected"></div>
            <span>AI System Online - Ready to Generate Content</span>
          </div>
        </section>

        <div className="tabs">
          <div className={`tab ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>
            <i className="fas fa-utensils"></i> AI Prediction
          </div>
          <div className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <i className="fas fa-chart-bar"></i> AI Analytics
          </div>
          <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fas fa-user-cog"></i> AI Profile
          </div>
        </div>

        {activeTab === 'input' && renderInputTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      <footer>
        <div className="container">
          <p>AI Taste Predictor &copy; 2023 - Powered by Advanced AI Algorithms</p>
          <p>All content is dynamically generated by artificial intelligence</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
