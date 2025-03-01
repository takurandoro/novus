// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, (req, res) => {
  const email = req.session.user.personalEmail;
  const salesRecord = global.sales[email] || { sales: [], wallet: 0, withdrawals: [] };
  const links = global.links || {};
  const products = Object.keys(links).filter(id => links[id].email === email).length;
  const sales = salesRecord.sales;
  const wallet = salesRecord.wallet;
  const customers = (() => {
    const set = new Set();
    sales.forEach(sale => set.add(sale.customerEmail));
    return set.size;
  })();
  res.render('dashboard', { 
    email,
    user: req.session.user,
    sales,
    wallet,
    products,
    customers,
    mainBrandColor: (Object.keys(links).length > 0 && links[Object.keys(links)[0]].mainBrandColor) || "#5563DE"
  });
});

router.get('/edit-profile', requireLogin, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Edit Profile - Novus</title>
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
          text-align: center; 
        }
        label {
          display: block;
          margin-top: 10px;
          font-weight: bold;
          text-align: left;
        }
        input {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        button {
          margin-top: 20px;
          padding: 10px 20px;
          background: linear-gradient(45deg, #FF6A00, #EE0979);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        button:hover {
          transform: scale(1.03);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Edit Profile</h2>
        <form action="/dashboard/edit-profile" method="post">
          <label>Full Name:</label>
          <input type="text" name="name" placeholder="Full Name" value="${req.session.user.name}" required>
          <label>Personal Email:</label>
          <input type="email" name="personalEmail" placeholder="Personal Email" value="${req.session.user.personalEmail || ''}" required>
          <label>Business Name:</label>
          <input type="text" name="businessName" placeholder="Business Name" value="${req.session.user.businessName}" required>
          <label>Business Phone:</label>
          <input type="text" name="phone" placeholder="Business Phone" value="${req.session.user.phone}" required>
          <label>Personal Email (cannot change):</label>
          <input type="email" name="email" placeholder="Personal Email" value="${req.session.user.personalEmail}" required readonly>
          <button type="submit">Update Profile</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

router.post('/edit-profile', requireLogin, (req, res) => {
  const { name, personalEmail, businessName, phone } = req.body;
  const email = req.session.user.personalEmail;
  if (global.users[email]) {
    global.users[email].name = name;
    global.users[email].personalEmail = personalEmail;
    global.users[email].businessName = businessName;
    global.users[email].phone = phone;
    req.session.user = global.users[email];
  }
  res.redirect('/dashboard');
});

module.exports = router;
