// routes/authRoutes.js
const express = require('express');
const router = express.Router();

// For demo purposes, using globals for users and sales.
global.users = global.users || {};
global.sales = global.sales || {};

// Home route: if logged in, redirect to dashboard; otherwise, redirect to login.
router.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// GET /signup – Display multi‑step signup form
router.get('/signup', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Signup - Novus</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Roboto', sans-serif;
        background: linear-gradient(135deg, #74ABE2, #5563DE);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        padding: 20px;
      }
      .container {
        background: #fff;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        max-width: 500px;
        width: 100%;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header h1 {
        color: #FF6A00;
        margin: 0;
        font-size: 2.5em;
      }
      .header p {
        font-size: 1.1em;
        color: #333;
      }
      .section { display: none; }
      .section.active { display: block; }
      .section h2 {
        text-align: center;
        color: #5563DE;
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-top: 10px;
        font-weight: bold;
      }
      input, textarea {
        width: 100%;
        padding: 10px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .summary {
        background: #f0f0f0;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        text-align: left;
        font-size: 0.95em;
      }
      .nav-btns {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
      }
      .nav-btns button {
        padding: 10px 20px;
        background: linear-gradient(45deg, #FF6A00, #EE0979);
        border: none;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .nav-btns button:hover { transform: scale(1.03); }
      .back-to-login {
        background: none;
        border: none;
        color: #FF6A00;
        font-weight: bold;
        cursor: pointer;
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Novus</h1>
        <p>Empowering local entrepreneurs with finance solutions</p>
      </div>
      <form action="/signup" method="post" id="signupForm">
        <!-- Section 1: Personal Details -->
        <div class="section active" id="section1">
          <h2>Personal Details</h2>
          <label>Full Name:</label>
          <input type="text" name="name" placeholder="Your full name" required>
          <label>Personal Email (used for login):</label>
          <input type="email" name="personalEmail" placeholder="Your email" required>
          <div class="nav-btns">
            <button type="button" class="back-to-login" onclick="window.location.href='/login'">Back to Login</button>
            <button type="button" onclick="nextSection()">Next</button>
          </div>
        </div>
        <!-- Section 2: Business Details -->
        <div class="section" id="section2">
          <h2>Business Details</h2>
          <label>Business Name:</label>
          <input type="text" name="businessName" placeholder="Your business name" required>
          <label>Business Phone Number:</label>
          <input type="text" name="phone" placeholder="Enter phone (start with country code, e.g., 250)" pattern="\\d{10,13}" title="Please enter 10 to 13 digits" required>
          <label>Main Activity:</label>
          <input type="text" name="mainActivity" placeholder="What is your main activity?" required>
          <div class="nav-btns">
            <button type="button" onclick="prevSection()">Back</button>
            <button type="button" onclick="nextSection()">Next</button>
          </div>
        </div>
        <!-- Section 3: KYC Confirmation -->
        <div class="section" id="section3">
          <h2>Confirm Your KYC</h2>
          <div class="summary">
            <p><strong>Full Name:</strong> <span id="confirmName"></span></p>
            <p><strong>Personal Email:</strong> <span id="confirmPersonalEmail"></span></p>
            <p><strong>Business Name:</strong> <span id="confirmBusinessName"></span></p>
            <p><strong>Business Phone:</strong> <span id="confirmPhone"></span></p>
            <p><strong>Main Activity:</strong> <span id="confirmActivity"></span></p>
            <p>This is the phone number you will receive all your payments on. Please confirm it’s accurate.</p>
          </div>
          <p>This information will be verified and cannot be edited later. If you need changes, click "Back". Otherwise, click "Confirm" to proceed.</p>
          <div class="nav-btns">
            <button type="button" onclick="prevSection()">Back</button>
            <button type="button" onclick="nextSection()">Confirm</button>
          </div>
        </div>
        <!-- Section 4: Account Security -->
        <div class="section" id="section4">
          <h2>Account Security</h2>
          <label>Password:</label>
          <input type="password" name="password" placeholder="Choose a password" required>
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" placeholder="Confirm password" required>
          <div class="nav-btns">
            <button type="button" onclick="prevSection()">Back</button>
            <button type="submit">Submit</button>
          </div>
        </div>
      </form>
    </div>
    <script>
      let currentSection = 1;
      const totalSections = 4;
      function showSection(n) {
        for (let i = 1; i <= totalSections; i++) {
          document.getElementById("section" + i).classList.remove("active");
        }
        document.getElementById("section" + n).classList.add("active");
      }
      function nextSection() {
        if (currentSection === 2) {
          // Populate KYC Confirmation before moving to Section 3
          document.getElementById("confirmName").textContent = document.querySelector("input[name='name']").value;
          document.getElementById("confirmPersonalEmail").textContent = document.querySelector("input[name='personalEmail']").value;
          document.getElementById("confirmBusinessName").textContent = document.querySelector("input[name='businessName']").value;
          document.getElementById("confirmPhone").textContent = document.querySelector("input[name='phone']").value;
          document.getElementById("confirmActivity").textContent = document.querySelector("input[name='mainActivity']").value;
        }
        if (currentSection < totalSections) {
          currentSection++;
          showSection(currentSection);
        }
      }
      function prevSection() {
        if (currentSection > 1) {
          currentSection--;
          showSection(currentSection);
        }
      }
    </script>
  </body>
  </html>
  `);
});

// POST /signup - Process signup and store user using personalEmail as key
router.post('/signup', (req, res) => {
  const { name, personalEmail, businessName, phone, password, confirmPassword, mainActivity } = req.body;
  if (password !== confirmPassword) {
    return res.send("Passwords do not match. <a href='/signup'>Try again</a>");
  }
  if (global.users[personalEmail]) {
    return res.send("User already exists. <a href='/login'>Login here</a>");
  }
  // Store user data using personalEmail as the key
  global.users[personalEmail] = { name, personalEmail, businessName, phone, password, mainActivity };
  global.sales[personalEmail] = { sales: [], wallet: 0, withdrawals: [] };
  req.session.user = global.users[personalEmail];
  res.redirect('/dashboard');
});

// GET /login – Display login form
router.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Login - Novus</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          background: linear-gradient(135deg, #74ABE2, #5563DE);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: #fff;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        .header {
          margin-bottom: 20px;
        }
        .header h1 {
          color: #FF6A00;
          margin: 0;
          font-size: 2.5em;
        }
        .header p {
          color: #333;
          margin: 5px 0 0;
          font-size: 1.1em;
        }
        h2 { color: #5563DE; margin-bottom: 20px; }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(45deg, #FF6A00, #EE0979);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 1em;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        button:hover { transform: scale(1.03); }
        a { color: #5563DE; text-decoration: none; font-weight: bold; }
        p { font-size: 0.9em; color: #666; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Novus</h1>
          <p>Empowering local entrepreneurs with finance solutions</p>
        </div>
        <h2>Login</h2>
        <form action="/login" method="post">
          <label>Personal Email:</label>
          <input type="email" name="personalEmail" placeholder="Your email" required>
          <label>Password:</label>
          <input type="password" name="password" placeholder="Your password" required>
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="/signup">Sign Up here</a></p>
      </div>
    </body>
    </html>
  `);
});

// POST /login - Process login using personalEmail as the key
router.post('/login', (req, res) => {
  const { personalEmail, password } = req.body;
  const user = global.users[personalEmail];
  if (!user || user.password !== password) {
    return res.send("Invalid credentials. <a href='/login'>Try again</a>");
  }
  req.session.user = user;
  res.redirect('/dashboard');
});

// GET /logout - Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
