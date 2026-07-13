import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', password: '', whatsapp: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        login(userData, token);
        setSuccess(`Welcome, ${userData.name}! 🎉`);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } catch (e) {
        setError('Google login failed. Please try again.');
      }
    }

    const errorParam = params.get('error');
    if (errorParam) {
      setError('Google login failed. Please try again.');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!form.email || !form.password) {
        setError('Please enter your email and password.');
        return;
      }
    } else {
      if (!form.name || !form.email || !form.password || !form.whatsapp) {
        setError('Please fill all required fields.');
        return;
      }
      if (form.whatsapp.length < 10) {
        setError('Please enter a valid 10-digit WhatsApp number.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      let response;

      if (isLogin) {
        response = await authAPI.login({
          email: form.email,
          password: form.password
        });
      } else {
        response = await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          whatsapp: form.whatsapp,
          address: form.address
        });
      }

      const { token, user } = response.data;
      login(user, token);
      setSuccess(isLogin ? `Welcome back, ${user.name}! 🎉` : `Account created! Welcome, ${user.name}! 🎉`);
      setTimeout(() => { navigate(-1); }, 1200);

    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <img src="/wheel-rotating.gif" alt="Educare Point" className="auth-logo" />
          <h2 className="auth-title">Educare Point</h2>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back! Login to continue.' : 'Create your account'}
          </p>
        </div>

        <div className="auth-toggle">
          <button
            className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            Login
          </button>
          <button
            className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="auth-error">⚠️ {error}</p>}
        {success && <p className="auth-success">✅ {success}</p>}

        <div className="auth-form">

          {!isLogin && (
            <div className="auth-field">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              placeholder="yourname@gmail.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              placeholder={isLogin ? 'Enter your password' : 'Min 6 characters'}
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div className="auth-field">
                <label>WhatsApp Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="10-digit WhatsApp number"
                  value={form.whatsapp}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
              <div className="auth-field">
                <label>Address <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  name="address"
                  placeholder="Your delivery address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button
            className="auth-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? (isLogin ? 'Logging in...' : 'Creating account...')
              : (isLogin ? '🔑 Login' : '🚀 Create Account')
            }
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            className="auth-google-btn"
            onClick={() => window.location.href = 'https://educarepointcybercafe-1.onrender.com/api/auth/google'}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>

        </div>

        <button className="auth-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

      </div>
    </div>
  );
}

export default Login;