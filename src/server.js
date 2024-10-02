import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const otpStore = {};

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, 
  auth: {
    user: 'roosevelt.kulas38@ethereal.email', // Ethereal email user
    pass: 'nng64uvtmNxAX1f8NB', // Ethereal email password
  },
});

app.post('/send-email', async (req, res) => {
  const { to, otp } = req.body;
  otpStore[to] = { otp, expiry: Date.now() + 60000 };  

  try {
    const info = await transporter.sendMail({
      from: 'roosevelt.kulas38@ethereal.email', 
      to: to, 
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<b>Your OTP code is: ${otp}</b>`, 
    });

    res.status(200).send(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});
app.post('/verify-otp', (req, res) => {
  const { to, otp } = req.body;

  // Check if OTP exists and is not expired
  if (otpStore[to] && otpStore[to].otp === otp && Date.now() < otpStore[to].expiry) {
    res.status(200).send('OTP verified successfully');
    delete otpStore[to];  // Clear the OTP after verification
  } else {
    res.status(400).send('Invalid or expired OTP');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
