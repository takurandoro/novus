// routes/customersRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

// GET /customers - List unique customers for the logged-in user
router.get('/', requireLogin, (req, res) => {
  const email = req.session.user.email;
  const sales = global.sales[email]?.sales || [];
  const customersSet = new Set();
  const customers = [];
  sales.forEach(sale => {
    if (!customersSet.has(sale.customerEmail)) {
      customersSet.add(sale.customerEmail);
      customers.push(sale);
    }
  });
  res.render('customers', { customers });
});

module.exports = router;
