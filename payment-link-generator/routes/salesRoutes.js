// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, (req, res) => {
  const email = req.session.user.personalEmail;
  const salesRecord = global.sales[email] || { sales: [] };
  const sales = salesRecord.sales;
  console.log("Sales for", email, sales);
  res.render('sales', { sales });
});

module.exports = router;
