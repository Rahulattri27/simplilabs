import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import axios from 'axios';

function EmailChecker() {
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [response, setResponse] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);

  // Function to generate a random OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

  // Email validation regex pattern
  const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // useEffect to check if email exists in Firebase when a valid email is typed
  useEffect(() => {
    const checkEmailInFirebase = async () => {
      if (isValidEmail) {
        const q = query(collection(db, 'users'), where('emailId', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setEmailExists(true); // Email exists in Firebase
        } else {
          setEmailExists(false); // Email does not exist
        }
      }
    };

    checkEmailInFirebase();
  }, [email, isValidEmail]); // Trigger when email or isValidEmail changes

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate the OTP
    const otp = generateOtp();

    // Send the email via the backend
    try {
      const res = await axios.post('http://localhost:5000/send-email', {
        to: email, // Email entered by the user
        otp: otp,  // Generated OTP
      });
      setResponse(`Email sent successfully: OTP is ${otp}`);
    } catch (error) {
      console.error('Error sending email:', error);
      setResponse('Failed to send email');
    }
  };

  // Validate email and update state
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValidEmail(emailValidationRegex.test(inputEmail)); // Check if it's a valid email
  };

  return (
    <div>
      <h2>Send OTP Email</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange} // Update email input state and check validity
            required
          />
        </div>

        {isValidEmail && (
          <p>{emailExists ? 'Email already exists in database' : 'Email is new'}</p>
        )}

        <button type="submit" disabled={!isValidEmail || emailExists}>
          Send OTP
        </button>
      </form>

      {response && <p>{response}</p>} {/* Display success or error message */}
    </div>
  );
}

export default EmailChecker;
