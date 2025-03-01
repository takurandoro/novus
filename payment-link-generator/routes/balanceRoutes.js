// routes/balanceRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, (req, res) => {
  const email = req.session.user.personalEmail;
  const salesRecord = global.sales[email] || { sales: [], wallet: 0, withdrawals: [] };
  res.render('balance', { 
    wallet: salesRecord.wallet, 
    withdrawals: salesRecord.withdrawals, 
    sales: salesRecord.sales 
  });
});

module.exports = router;
