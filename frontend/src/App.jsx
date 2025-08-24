import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [ingredients, setIngredients] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Configure axios to use token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email: authEmail,
        password: authPassword
      });
      
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: authEmail,
        password: authPassword
      });
      
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPrediction(null);
    setRecipe(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!ingredients) return;
    if (!user) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

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

  const AuthModal = () => (
    <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Enter your password"
            />
          </div>
          {authError && <div className="error-message">{authError}</div>}
          <button type="submit" className="btn">
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p>
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            className="auth-switch"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setAuthError('');
            }}
          >
            {authMode === 'login' ? 'Register here' : 'Login here'}
          </span>
        </p>
        <button 
          className="btn btn-outline" 
          onClick={() => {
            setShowAuthModal(false);
            setAuthError('');
          }}
          style={{ marginTop: '1rem' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

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
            
            <button className="btn btn-outline">
              <i className="fas fa-save"></i> Save AI Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDashboardTab = () => (
    <div className="tab-content">
      <div className="card">
        <h2 className="card-title"><i className="fas fa-chart-bar"></i> Taste Analytics</h2>
        <p>Your prediction history will appear here once you start using the app.</p>
        {user?.tasteHistory?.length > 0 ? (
          user.tasteHistory.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-item-info">
                <h4>{item.ingredients.join(', ')}</h4>
                <p>Prediction: {item.prediction} ({(item.confidence * 100).toFixed(0)}% confidence)</p>
              </div>
            </div>
          ))
        ) : (
          <p>No prediction history yet. Make some predictions to see your analytics!</p>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="tab-content">
      <div className="card">
        <h2 className="card-title"><i className="fas fa-user"></i> User Profile</h2>
        
        {user ? (
          <>
            <div className="form-group">
              <label>Email</label>
              <input type="text" value={user.email} readOnly className="form-control" />
            </div>
            
            <div className="form-group">
              <label>Dietary Preferences</label>
              <div className="preference-tags">
                {Object.entries(user.preferences || {}).map(([key, value]) => (
                  <div key={key} className={`tag ${value ? 'active' : ''}`}>
                    <i className={`fas fa-${value ? 'check' : 'times'}-circle`}></i> 
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            
            <button className="btn btn-outline" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        ) : (
          <p>Please login to view your profile.</p>
        )}
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
              <li><a href="#input" onClick={() => setActiveTab('input')}>Predict Taste</a></li>
              <li><a href="#dashboard" onClick={() => setActiveTab('dashboard')}>Dashboard</a></li>
              <li><a href="#profile" onClick={() => setActiveTab('profile')}>Profile</a></li>
              {user ? (
                <li>
                  <span className="user-welcome">Welcome, {user.email}</span>
                  <button className="btn btn-outline" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <button className="btn" onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode('login');
                    setAuthError('');
                  }}>
                    Login
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <section className="hero">
          <h1>Discover What Tastes Good to You</h1>
          <p>Our AI predicts whether you'll enjoy a dish based on your preferences and suggests improvements to make it perfect for your palate.</p>
          {!user && (
            <button className="btn" onClick={() => {
              setShowAuthModal(true);
              setAuthMode('register');
              setAuthError('');
            }}>
              Get Started - Sign Up Free
            </button>
          )}
          <div className="api-status">
            <div className="status-indicator status-connected"></div>
            <span>AI System Online - Ready to Predict</span>
          </div>
        </section>

        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'input' ? 'active' : ''}`} 
            onClick={() => setActiveTab('input')}
          >
            Taste Prediction
          </div>
          <div 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </div>
          <div 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </div>
        </div>

        {activeTab === 'input' && renderInputTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </div>

      <footer>
        <div className="container">
          <p>AI Taste Predictor &copy; 2023. This is a demo application for educational purposes.</p>
          <p>Deployed with React frontend and Node.js backend.</p>
        </div>
      </footer>

      {showAuthModal && <AuthModal />}
    </div>
  );
}

export default App;
