import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserCircle, ChefHat, Shield } from 'lucide-react';
import { authAPI, handleAPIError } from './api-service';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const loginResponse = await authAPI.login(formData.email, formData.password);
        
        // Get user details after successful login
        try {
          const userDetails = await authAPI.getCurrentUser();
          
          if (onLogin) {
            onLogin({
              email: userDetails.email,
              role: userDetails.role?.toLowerCase() || 'customer',
              name: userDetails.name,
              id: userDetails.id,
              token: loginResponse.token
            });
          }
        } catch (userError) {
          // If we can't get user details, still proceed with login
          console.warn('Could not fetch user details:', userError);
          if (onLogin) {
            onLogin({
              email: formData.email,
              role: loginResponse.role?.toLowerCase() ||  'customer',
              name: formData.email.split('@')[0],
              token: loginResponse.token
            });
          }
        }
      } else {
        // Registration flow - only customers can self-register. Staff/Admin are added by admin only.
        let userData;
        
        try {
          userData = await authAPI.register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          });

          // After successful registration, automatically log in
          try {
            const loginResponse = await authAPI.login(formData.email, formData.password);

            // Map backend role to frontend role (new registrations are always customers)
            const frontendRole = userData.role?.toLowerCase() || 'customer';

            if (onLogin) {
              onLogin({
                email: userData.email,
                role: frontendRole,
                name: userData.name,
                id: userData.id,
                token: loginResponse.token
              });
            }
          } catch (loginError) {
            // Registration succeeded but login failed
            console.error('Auto-login after registration failed:', loginError);
            setApiError('Registration successful, but automatic login failed. Please try logging in manually.');
            setLoading(false);
          }
        } catch (registrationError) {
          // Registration failed
          console.error('Registration failed:', registrationError);
          setApiError(handleAPIError(registrationError));
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setApiError(handleAPIError(error));
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');
        
        :root {
          --primary: #E63946;
          --secondary: #6366F1;
          --accent: #2A9D8F;
          --dark: #1A1A1D;
          --gray: #6B7280;
          --light: #F9FAFB;
          --white: #FFFFFF;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .auth-page::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }
        
        .auth-page::after {
          content: '';
          position: absolute;
          bottom: -150px;
          left: -150px;
          width: 500px;
          height: 500px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          animation: float 15s infinite ease-in-out reverse;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(40px, -40px) rotate(10deg); }
        }
        
        .auth-container {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 1100px;
          width: 100%;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Left Panel - Brand */
        .brand-panel {
          background: linear-gradient(135deg, var(--primary) 0%, #C1121F 100%);
          color: white;
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        .brand-panel::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        
        .brand-content {
          position: relative;
          z-index: 1;
        }
        
        .brand-logo {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -1px;
        }
        
        .brand-tagline {
          font-size: 1.25rem;
          opacity: 0.95;
          margin-bottom: 3rem;
          font-weight: 500;
        }
        
        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.1);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .feature-text h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .feature-text p {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        /* Right Panel - Form */
        .form-panel {
          padding: 4rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .form-header {
          margin-bottom: 2.5rem;
        }
        
        .form-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }
        
        .form-subtitle {
          color: var(--gray);
          font-size: 1rem;
        }
        
        /* Role Selection */
        .role-selection {
          margin-bottom: 2rem;
        }
        
        .role-label {
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 1rem;
          display: block;
          font-size: 0.95rem;
        }
        
        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .role-card {
          padding: 1rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          background: white;
        }
        
        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .role-card.active {
          border-color: var(--primary);
          background: linear-gradient(135deg, rgba(230, 57, 70, 0.05) 0%, rgba(230, 57, 70, 0.1) 100%);
        }
        
        .role-card.active.staff {
          border-color: var(--secondary);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%);
        }
        
        .role-card.active.admin {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(42, 157, 143, 0.05) 0%, rgba(42, 157, 143, 0.1) 100%);
        }
        
        .role-icon-wrapper {
          width: 48px;
          height: 48px;
          margin: 0 auto 0.75rem;
          background: #F3F4F6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .role-card.active .role-icon-wrapper {
          background: var(--primary);
          color: white;
        }
        
        .role-card.active.staff .role-icon-wrapper {
          background: var(--secondary);
        }
        
        .role-card.active.admin .role-icon-wrapper {
          background: var(--accent);
        }
        
        .role-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--dark);
          margin-bottom: 0.25rem;
        }
        
        .role-desc {
          font-size: 0.75rem;
          color: var(--gray);
          line-height: 1.3;
        }
        
        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-label {
          font-weight: 600;
          color: var(--dark);
          font-size: 0.9rem;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        
        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 1rem;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          background: white;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(230, 57, 70, 0.1);
        }
        
        .form-input.error {
          border-color: #EF4444;
        }
        
        .error-message {
          color: #EF4444;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
        }
        
        .password-toggle:hover {
          color: var(--dark);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
          margin-top: 0.5rem;
        }
        
        .submit-btn:hover {
          background: #C1121F;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(230, 57, 70, 0.3);
        }
        
        .submit-btn:active {
          transform: translateY(0);
        }
        
        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E7EB;
        }
        
        .toggle-text {
          color: var(--gray);
          font-size: 0.95rem;
        }
        
        .toggle-link {
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          margin-left: 0.25rem;
        }
        
        .toggle-link:hover {
          text-decoration: underline;
        }
        
        .demo-credentials {
          background: #FEF3C7;
          padding: 1rem;
          border-radius: 12px;
          margin-top: 1.5rem;
          border: 2px solid #FCD34D;
        }
        
        .demo-title {
          font-weight: 700;
          color: #92400E;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .demo-item {
          font-size: 0.85rem;
          color: #78350F;
          margin: 0.25rem 0;
        }
        
        .demo-item strong {
          color: #92400E;
        }
        
        @media (max-width: 968px) {
          .auth-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          
          .brand-panel {
            display: none;
          }
          
          .form-panel {
            padding: 2rem;
          }
          
          .role-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="auth-container">
        {/* Left Panel - Brand */}
        <div className="brand-panel">
          <div className="brand-content">
            <div className="brand-logo">Foodie</div>
            <p className="brand-tagline">Digital Menu & Order Management</p>
            
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <UserCircle size={24} />
                </div>
                <div className="feature-text">
                  <h3>QR Code Ordering</h3>
                  <p>Scan & order from your table instantly</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <ChefHat size={24} />
                </div>
                <div className="feature-text">
                  <h3>Kitchen Management</h3>
                  <p>Real-time order tracking for staff</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <div className="feature-text">
                  <h3>Admin Dashboard</h3>
                  <p>Complete control over your restaurant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="form-panel">
          <div className="form-header">
            <h1 className="form-title">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="form-subtitle">
              {isLogin 
                ? 'Sign in to access your account' 
                : 'Create a customer account to order food'}
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={20} />
                    <input
                      type="text"
                      name="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={20} />
                    <input
                      type="tel"
                      name="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            {apiError && (
              <div className="error-message" style={{ 
                padding: '0.75rem', 
                background: '#FEE2E2', 
                borderRadius: '8px',
                border: '1px solid #EF4444',
                textAlign: 'center'
              }}>
                {apiError}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="form-footer">
            <span className="toggle-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <a className="toggle-link" onClick={toggleMode}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </a>
          </div>

          {isLogin && (
            <div className="demo-credentials">
              <div className="demo-title">🔑 Demo Credentials (for testing)</div>
              <div className="demo-item"><strong>Customer:</strong> customer@demo.com / pass123</div>
              <div className="demo-item"><strong>Staff:</strong> staff@demo.com / pass123 <em style={{ fontSize: '0.8rem' }}>(added by admin)</em></div>
              <div className="demo-item"><strong>Admin:</strong> admin@demo.com / pass123 <em style={{ fontSize: '0.8rem' }}>(admin only)</em></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;