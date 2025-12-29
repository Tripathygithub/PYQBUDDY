import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import QuestionForm from './components/QuestionForm';
import QuestionsList from './components/QuestionsList';
import QuestionView from './components/QuestionView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">PYQBUDDY Admin Panel</h1>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    setIsAuthenticated(false);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              )}
            </div>
            
            {/* Navigation */}
            {isAuthenticated && (
              <nav className="mt-4 flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Question
                </Link>
                <Link
                  to="/questions"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View All Questions
                </Link>
              </nav>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLogin={() => setIsAuthenticated(true)} />
                )
              } 
            />
            
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <QuestionForm />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/questions" 
              element={
                isAuthenticated ? (
                  <QuestionsList />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/questions/:id" 
              element={
                isAuthenticated ? (
                  <QuestionView />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route 
              path="/edit/:id" 
              element={
                isAuthenticated ? (
                  <QuestionForm />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Simple Login Component
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Clear any old expired tokens before logging in
    localStorage.removeItem('adminToken');

    try {
      const response = await fetch('http://localhost:9235/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      console.log('Login response:', data);

      if (data.success) {
        // Token is at data.data.tokens.accessToken
        const token = data.data.tokens?.accessToken || data.data.token;
        console.log('Storing token:', token ? 'Found' : 'Missing');
        localStorage.setItem('adminToken', token);
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running on port 9235');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>Note: Only admin users can access this panel</p>
      </div>
    </div>
  );
};

export default App;
