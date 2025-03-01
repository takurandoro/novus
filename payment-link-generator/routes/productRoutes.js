// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

router.get('/', requireLogin, (req, res) => {
  const email = req.session.user.personalEmail;
  
  // Convert global.links into an array and filter by the logged-in user's email.
  const products = Object.keys(global.links)
    .map(id => ({ id, ...global.links[id] }))
    .filter(product => product.email === email);
  
  // For debugging: Uncomment the next two lines if needed
  // console.log("Global links:", global.links);
  // console.log("Filtering product links for email:", email);
  
  res.render('products', { products });
});

// Route to delete a product link.
// (Note: Using a GET request for deletion is not ideal for production,
// but it works for a demo.)
router.get('/delete/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const email = req.session.user.personalEmail;
  
  // Only delete if the product link exists and belongs to the logged-in user.
  if (global.links[id] && global.links[id].email === email) {
    delete global.links[id];
  }
  res.redirect('/products');
});

module.exports = router;
