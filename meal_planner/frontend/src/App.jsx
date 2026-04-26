import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8002';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    minutes: '',
    ingredients: '',
    steps: '',
    tags: '',
    calories: ''
  });

  // Fetch all recipes
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/recipes`);
      setRecipes(response.data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecipe = async () => {
    if (!newRecipe.name.trim()) {
      alert('Please enter a recipe name');
      return;
    }

    const recipeData = {
      name: newRecipe.name,
      minutes: parseInt(newRecipe.minutes) || 30,
      ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim()),
      steps: newRecipe.steps.split('\n').filter(s => s.trim()),
      tags: newRecipe.tags.split(',').map(t => t.trim()),
      calories: parseFloat(newRecipe.calories) || null
    };

    try {
      await axios.post(`${API_BASE}/recipes`, recipeData);
      setNewRecipe({
        name: '',
        minutes: '',
        ingredients: '',
        steps: '',
        tags: '',
        calories: ''
      });
      setShowForm(false);
      fetchRecipes();
      alert('Recipe added successfully!');
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe');
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await axios.delete(`${API_BASE}/recipes/${id}`);
        fetchRecipes();
        alert('Recipe deleted successfully!');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#1e293b', marginBottom: '5px' }}>🍽 Meal Planner</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>manage your recipes and meal plans</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: '#1e293b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '40px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showForm ? '− cancel' : '+ add recipe'}
          </button>
        </div>

        {/* Add Recipe Form */}
        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px', color: '#1e293b' }}>New Recipe</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <input
                type="text"
                placeholder="Recipe name *"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
              <input
                type="number"
                placeholder="Minutes to cook"
                value={newRecipe.minutes}
                onChange={(e) => setNewRecipe({...newRecipe, minutes: e.target.value})}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newRecipe.tags}
                onChange={(e) => setNewRecipe({...newRecipe, tags: e.target.value})}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
              <input
                type="number"
                placeholder="Calories (optional)"
                value={newRecipe.calories}
                onChange={(e) => setNewRecipe({...newRecipe, calories: e.target.value})}
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>
            <textarea
              placeholder="Ingredients (one per line)"
              value={newRecipe.ingredients}
              onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
              rows="4"
              style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit' }}
            />
            <textarea
              placeholder="Steps (one per line)"
              value={newRecipe.steps}
              onChange={(e) => setNewRecipe({...newRecipe, steps: e.target.value})}
              rows="4"
              style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit' }}
            />
            <button
              onClick={addRecipe}
              style={{
                marginTop: '20px',
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                width: '100%'
              }}
            >
              save recipe →
            </button>
          </div>
        )}

        {/* Recipes List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📖</span>
            <p style={{ color: '#64748b' }}>no recipes yet. click "add recipe" to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {recipes.map((recipe) => (
              <div key={recipe.id} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1e293b' }}>{recipe.name}</h3>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '30px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#dc2626'
                    }}
                  >
                    delete
                  </button>
                </div>
                
                {recipe.minutes && (
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>⏱ {recipe.minutes} minutes</p>
                )}
                
                {recipe.calories && (
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>🔥 {recipe.calories} calories</p>
                )}
                
                {recipe.tags && recipe.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {recipe.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#475569' }}>#{tag}</span>
                    ))}
                  </div>
                )}
                
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#3b82f6' }}>view details →</summary>
                  <div style={{ marginTop: '12px' }}>
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ fontSize: '12px', color: '#475569' }}>Ingredients:</strong>
                        <ul style={{ marginTop: '6px', marginLeft: '20px', color: '#64748b', fontSize: '13px' }}>
                          {recipe.ingredients.slice(0, 5).map((ing, idx) => <li key={idx}>{ing}</li>)}
                          {recipe.ingredients.length > 5 && <li>+{recipe.ingredients.length - 5} more</li>}
                        </ul>
                      </div>
                    )}
                    {recipe.steps && recipe.steps.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '12px', color: '#475569' }}>Steps:</strong>
                        <ol style={{ marginTop: '6px', marginLeft: '20px', color: '#64748b', fontSize: '13px' }}>
                          {recipe.steps.slice(0, 3).map((step, idx) => <li key={idx}>{step}</li>)}
                          {recipe.steps.length > 3 && <li>+{recipe.steps.length - 3} more</li>}
                        </ol>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;