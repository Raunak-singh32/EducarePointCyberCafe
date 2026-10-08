import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  // 1. Updated variable naming explicitly to 'email' to match backend schema properties
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 2. Clear payload keys aligning fully against backend extraction properties
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email, 
        password: formData.password
      }, { withCredentials: true });

      // 3. Process backend structural response confirmation
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      } else {
        setError('Authentication payload invalid. Please review server routing logs.');
      }
    } catch (error) {
      console.error("Login verification routing exception:", error);

      // 4. Rate-limiter evaluation hook handling status blocks
      if (error.response && error.response.status === 429) {
        const rateLimitMessage = error.response.data.error || "Too many attempts. Locked out.";
        setError(rateLimitMessage);
      } 
      // 5. Handling real error tracking structural text directly from your backend responses
      else if (error.response && error.response.data) {
        setError(error.response.data.message || 'Invalid username or password');
      } 
      else {
        setError('Network pipeline execution stalled. Ensure your server node context is active.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>🔐 Admin Login</h2>
        <p>Educare Point Cyber Cafe</p>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="enter email: admin@educare.com"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
