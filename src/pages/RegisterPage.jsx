import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';
import axios from '../utils/axiosInstance';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // First name and last name are optional in this implementation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: 'Creating your account...', type: 'info' });
    
    try {
      // Prepare register request data
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null
      };
      
      console.log('Sending registration data:', registerData);
      
      // Make API request to register
      const response = await axios.post('/auth/register', registerData);
      console.log('Registration successful:', response.data);
      
      // If registration was successful and we got a token
      if (response.data && response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify({
            username: response.data.user.username || formData.username,
            firstName: response.data.user.firstName || formData.firstName || '',
            lastName: response.data.user.lastName || formData.lastName || ''
          }));
          
          console.log('User data saved after registration');
        } else {
          // If no user data in response, store what we have
          localStorage.setItem('userData', JSON.stringify({
            username: formData.username,
            firstName: formData.firstName || '',
            lastName: formData.lastName || ''
          }));
        }
        
        setMessage({ text: 'Registration successful! Redirecting...', type: 'success' });
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage({ 
          text: 'Registration successful, but no token received. Please log in.',
          type: 'warning'
        });
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        console.log('Error response:', error.response);
        
        // Handle specific error cases
        if (error.response.status === 409) {
          if (error.response.data.error.includes('Username')) {
            setErrors({
              ...errors,
              username: 'This username is already taken'
            });
            errorMessage = 'This username is already taken';
          } else if (error.response.data.error.includes('Email')) {
            setErrors({
              ...errors,
              email: 'This email is already registered'
            });
            errorMessage = 'This email is already registered';
          } else {
            errorMessage = error.response.data.error || errorMessage;
          }
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create your SmartExpense Account</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
          
          <button 
            type="submit" 
            className="register-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Log in instead</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;