import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients) return;

    setIsLoading(true);
    setPrediction('');

    try {
      const response = await axios.post(`${API_URL}/api/predict`, {
        ingredients,
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error(error);
      setPrediction('Oops! Could not get a prediction. Check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Taste Predictor 🍔</h1>
      <p>Enter some ingredients and see if your dish will be delicious!</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g., chicken, rice, soy sauce, broccoli..."
          rows="3"
          disabled={isLoading}
        />
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Predict Taste!'}
        </button>
      </form>

      {prediction && (
        <div className="prediction-result">
          <h2>Prediction:</h2>
          <p>"{prediction}"</p>
        </div>
      )}
    </div>
  );
}

export default App;
