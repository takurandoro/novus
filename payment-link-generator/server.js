// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

// Middleware configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount route modules
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const linkRoutes = require('./routes/linkRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const productRoutes = require('./routes/productRoutes'); // Updated
const salesRoutes = require('./routes/salesRoutes'); // Ensure this file exists if needed

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/generate', linkRoutes);
app.use('/payment-complete', paymentRoutes);
app.use('/withdraw', withdrawRoutes);
app.use('/balance', balanceRoutes);
app.use('/products', productRoutes);
app.use('/sales', salesRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
