import React, { useState } from 'react';
import './Register.css'; // 💡 we'll create this next
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registering user:', user);
    // Backend integration comes next!
    // Simulate success or use actual backend response here
setTimeout(() => {
  alert('Registration successful! Redirecting to login...');
  navigate('/login');
}, 500); // Wait half a second before redirecting

  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
