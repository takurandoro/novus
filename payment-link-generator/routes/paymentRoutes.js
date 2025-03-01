// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

router.post('/', requireLogin, (req, res) => {
  const { linkId, customerName, customerEmail, customerPhone, productName, price, currency } = req.body;
  
  // Get product link data.
  const linkData = global.links[linkId];
  if (!linkData) {
    return res.status(400).json({ success: false, message: 'Invalid link ID.' });
  }
  
  // Create a sale record.
  const sale = {
    linkId,
    productName,
    amount: parseFloat(price),
    currency,
    customerName,
    customerEmail,
    customerPhone,
    date: new Date()
  };
  
  // Use the merchant's personalEmail stored in the link.
  const email = linkData.email;
  if (!global.sales[email]) {
    global.sales[email] = { sales: [], wallet: 0, withdrawals: [] };
  }
  global.sales[email].sales.push(sale);
  global.sales[email].wallet += sale.amount;
  res.json({ success: true, sale });
});

module.exports = router;
