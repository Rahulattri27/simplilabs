import React, { useState, useRef, useEffect, useCallback } from "react";
import logo from "./assets/download.png";
import "./login_signup.css";
import { NavLink } from "react-router-dom";
import { auth, db } from '../firebase.js';
import { createUserWithEmailAndPassword} from "firebase/auth";
import { doc, setDoc,collection,query,where,getDocs } from "firebase/firestore";
import axios from "axios";


function Login_signup() {
  const [firstname, Setfirstname] = useState('');
  const [lastname, Setlastname] = useState('');
  const [mobile_no, Setmobileno] = useState('');
  const [emailId, SetemailId] = useState('');
  const [emailExists,SetEmailExists]=useState(false);
  const [isValidEmail,SetIsValidEmail]=useState(false);
  const [password, setPassword] = useState(''); 
  const otpfield = useRef(null);
  const MessageDiv = useRef(null);
  const [otp, setOTP] = useState('');
  const [notSentOtp,setNotSentOtp]=useState(true);
  const [generateOTP, setGenerateOTP] = useState(false);
  const [response, setResponse] = useState('');
  const [unselected,setUnselected]=useState(true);
  const [otpTimer, setOtpTimer] = useState(59); 
  const [isOtpTimerRunning, setIsOtpTimerRunning] = useState(false);
  const [formErrors, setFormErrors] = useState({
    firstname: false,
    lastname: false,
    mobile_no: false,
    emailId: false,
    password: false,
    otp: false
  });
  const [countries, SetCountries] = useState([]);
  const emailValidationRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        const india = sortedCountries.find((country) => country.name.common === "India");
        const otherCountries = sortedCountries.filter((country) => country.name.common !== "India");
        SetCountries([india, ...otherCountries]);
      })
      .catch((error) => {
        console.error("Error fetching countries", error);
      });
  }, []);


  //Otptimer
  useEffect(() => {
    let timer;
    if (isOtpTimerRunning && otpTimer > 0) {
        timer = setInterval(() => {
            setOtpTimer(prev => prev - 1);
        }, 1000);
    } else if (otpTimer === 0) {
        clearInterval(timer);
        setIsOtpTimerRunning(false); 
    }
    
    return () => clearInterval(timer); 
}, [isOtpTimerRunning, otpTimer]);

  //

  //HandleSelectchange
  const handleSelectChange=(e)=>{
    const val=e.target.value;
    if(val !== ''){
      setUnselected(false);
    }
    else{
      setUnselected(true);
    }
  }
  //

  // Random OTP generator
  const otpGenerator = useCallback(() => {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      let num = Math.floor(Math.random() * 10);
      otp = otp + num;
    }
    setOTP(otp);
    // window.localStorage.removeItem('otp');
    // window.localStorage.setItem('otp',otp);
    window.localStorage.setItem('otpAttempts',0);

  }, [generateOTP]);

  useEffect(otpGenerator, [generateOTP, otpGenerator]);

  //field verification
  const validateForm = () => {
    const errors = {
      firstname: firstname === '' ? 'First Name is required' : '',
      lastname: lastname === '' ? 'Last Name is required' : '',
      mobile_no: mobile_no === '' ? 'Mobile Number is required' : '',
      emailId: emailId === '' || !isValidEmail ? 'Valid Email is required' : '',
      password: password === '' ? 'Password is required' : '',
      otp: notSentOtp || (notSentOtp === false && otp === '') ? 'OTP is required' : ''
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error); 
  };

  //

  //send email otp
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; 
    setGenerateOTP((prev) => !prev);
    otpfield.current.style.display = "block";
    // e.target.style.display = "none";
    setNotSentOtp(false);
    
    try {
      const res = await axios.post('http://localhost:5000/send-email', {
        to:emailId,
        otp:otp,
      });
      showMessage(`Otp sent Successfully ${otp}`);
      setIsOtpTimerRunning(true);
    } catch (error) {
      console.error('Error sending email', error);
      showMessage('Failed to send email');
      // setIsOtpTimerRunning(true);
    }
  };

  //
  async function verifyOTP(inputOtp){
    // e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/verify-otp', {
        to: emailId,
        otp: inputOtp,
      });
      if (res.status === 200) {
        showMessage('OTP verified successfully!');
        return true;
        // Proceed with registration or other logic
      }
    } catch (error) {
      showMessage('Invalid or expired OTP.');
      
    }
    return false;
  };

  //UseEffect to check Email from database
useEffect(()=>{
  const checkEmailInFirebase = async () => {
    if (isValidEmail) {
      const q = query(collection(db, 'users'), where('emailId', '==', emailId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        SetEmailExists(true); // Email exists in Firebase
      } else {
        SetEmailExists(false); // Email does not exist
      }
    }
  };

  checkEmailInFirebase();
}, [emailId, isValidEmail])

const handleEmailChange = (e) => {
  const inputEmail = e.target.value;
  SetemailId(inputEmail);
  SetIsValidEmail(emailValidationRegex.test(inputEmail)); // Check if it's a valid email
};

//   //configure invisible recaptcha
//   function configureRecaptcha(){
//     window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
//         'size': 'invisible',
//         'callback': (response) => {
//           // reCAPTCHA solved, allow signInWithPhoneNumber.
//           onSignInSubmit();
//         },
//         defaultCountry:'IN'
//       });

//   }
// //

  // Show message div
  function showMessage(message) {
    MessageDiv.current.style.display = "block";
    MessageDiv.current.innerHTML = message;
  }

  // on submit function
  const onSubmit = (e) => {
    e.preventDefault();
    
    // Firebase authentication call with email and password
    createUserWithEmailAndPassword(auth, emailId, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
          emailId: emailId,
          firstname: firstname,
          lastname: lastname,
          mobile_no: mobile_no
        };

        showMessage("Account created successfully");

        const docRef = doc(db, "users", user.uid);  // Use user.uid instead of user.id
        setDoc(docRef, userData)
          .then(() => {
            window.location.href = 'welcome';
          })
          .catch((error) => {
            console.log("Error in writing document", error);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error Code: ${errorCode}, Message: ${errorMessage}`);

        if (errorCode === 'auth/email-already-in-use') {
          showMessage("Account already exists.");
        } else if (errorCode === 'auth/invalid-email') {
          showMessage("Invalid email address.");
        } else if (errorCode === 'auth/weak-password') {
          showMessage("Password should be at least 6 characters.");
        } else {
          showMessage("Unable to create an account.");
        }
      });
  };
  const onSubmitVerify = async (e) => {
    e.preventDefault();
    const inputOtp = document.getElementById("otp_verify").value;
    const validOtp=await verifyOTP(inputOtp);
    if (validOtp) {
      onSubmit(e);  // Call the registration function if OTP is valid
    } else {
      let attempts = parseInt(localStorage.getItem('otpAttempts')) || 0;
      attempts += 1;
      localStorage.setItem('otpAttempts', attempts);
      if (attempts >= 5) {
        showMessage("Zero attempts left. Try again later.");
        document.getElementById('otp_verify').disabled = true;
      } else {
        showMessage(`Incorrect OTP. ${5 - attempts} attempts left.`);
      }
    }

};

  return (
    <div className="container">

      <div className="img_container">
        <div ref={MessageDiv} className="Message_div" id="signup" style={{ display: "none" }}></div>
      </div>
      <div className="form_container">
        <form method="POST" >
          <img id="logo" src={logo} alt="Logo" />

          <h2>Register as an Expert</h2>
          <div className="inputFields">
            <div className="label-container" id="designation">
            <select className={`label-field ${unselected ? "unselected" : ""}`} name="designation" id="Designation" onChange={handleSelectChange} >
              <option value="" hidden></option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Miss.">Miss</option>
              <option value="Dr.">Dr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Prof.">Prof.</option>
            </select>
            <label className="labels" htmlFor="designation">Mr./Mrs.</label>
            </div>

            <div className="label-container">
            <input className="label-field" type="text" id="first_name" value={firstname}  onChange={(e) => Setfirstname(e.target.value)} required />
            <label className="labels"  htmlFor="first_name">FirstName*</label>
            
            </div>
            <div className="label-container">
            <input className="label-field" type="text" id="last_name" value={lastname}  onChange={(e) => Setlastname(e.target.value)} required />
            <label className="labels" htmlFor="last_name">LastName*</label>
          </div>
          </div>

          <div className="inputFields">

          <div className="label-container" id="Isd">
            
            <select className={`${unselected ? "unselected" : ""} label-field`} onChange={handleSelectChange} id="ISD">
              <option value="" hidden></option>
              {countries.map((country) => (
                <option key={country.cca2} value={country.cca2}>
                   {country.name.common}({country.idd?.root}{country.idd?.suffixes?.[0] || ""})
                </option>
              ))}
            </select>
              <label className="labels" htmlFor="ISD">ISD</label>
            </div>
            <div className="label-container">

            <input className="label-field" id="phone_no" type="number" maxLength={12} minLength={6} value={mobile_no}  onChange={(e) => Setmobileno(e.target.value)} required />
            <label className="labels" htmlFor="phone_no">PhoneNo.*</label>
          </div>
          </div>
          

          <div className="inputFields">

          <div className="label-container">
            <input className="label-field" id="emailID" type="email" value={emailId}  onChange={handleEmailChange} required />
            <label className="labels" htmlFor="email">Email ID *</label>
            {isValidEmail && (
          <p>{emailExists ? 'Email already exists in database' : 'Email is new'}</p>
        )}
          </div>
          </div>


          <div className="inputFields">

          <div className="label-container">
            <input className="label-field" id="password" type="password" value={password}  onChange={(e) => setPassword(e.target.value)} required />
            <label className="labels" htmlFor="password">Password*</label>
          </div>
          </div>

          <div className="inputFields" ref={otpfield} id="otp_div" style={{ display: "none" }}>

          <div className="label-container">
            <input className="label-field" id="otp_verify" type="number" minLength={6} maxLength={6} />
            <label className="labels" htmlFor="otp_verify">OTP*</label>
            <br></br>
            {isOtpTimerRunning && (
        <div style={{ color: 'red', textAlign: 'right', marginTop: '5px' }}>
            OTP expires in: {otpTimer}s
        </div>
    )}
          </div>
          </div>
          {/* <div id="sign-in-button"></div> */}
          {response && <p>{response}</p>}


          {notSentOtp?<button className="button" onClick={handleSubmit} >Get OTP on email</button>:<button className="button" id="Register" onClick={onSubmitVerify} disabled={!isValidEmail || emailExists}>Register</button>}

        



          <p>Already have an account? <span><NavLink to="Login">Sign in</NavLink></span></p>
        </form>
        </div>
      </div>

  );
}

export default Login_signup;
