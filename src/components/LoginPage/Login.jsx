import React, { useState } from 'react';
import { auth, provider } from '../../firebase.js';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import './Login.css';
import { NavLink } from 'react-router-dom';
import logo from "../assets/download.png";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Email & Password Login
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(''); // Clear error message
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem('loggedinuserid', user.uid);
        window.location.href = 'welcome'; // Change to the correct route after login
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/user-not-found') {
          setError('Account does not exist. Please register first.');
        } else if (errorCode === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else if (errorCode === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else {
          setError('Failed to log in. Please try again.');
        }
      });
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google sign-in successful:', user);
      localStorage.setItem('loggedinuserid', user.uid);
      window.location.href = '/'; // Redirect after Google sign-in
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
     
     </div>
      <div className="login-form-container">
        <div className="login-form-content">
          <img src={logo} alt="Infollion logo" className="logo" />
          <h2>Login to Dashboard</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email/Username</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email/Username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="sign-in-button">Sign in</button>
          </form>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <button className="google-sign-in" onClick={signInWithGoogle}>
            <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google logo" />
            Sign in with Google
          </button>

          <button className="otp-login">Login with OTP</button>

          <p className="register-link">
            Don't have an account? <NavLink to='/'>Register as an Expert</NavLink>
          </p>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      
    </div>
  );
}

export default Login;
