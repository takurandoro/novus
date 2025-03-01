// routes/linkRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');

// Ensure global.links is initialized.
global.links = global.links || {};

/**
 * Helper function: Returns a common header HTML.
 * This header is used on pages where the "Go to Home" button should appear.
 */
function commonHeader() {
  return `
    <div class="common-header">
      <div class="brand">
        <h1>Novus</h1>
        <p>Empowering local entrepreneurs with finance solutions</p>
      </div>
      <a class="home-btn" href="/dashboard">Go to Home</a>
    </div>
    <style>
      .common-header {
        background: #fff;
        padding: 20px;
        width: 100%;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        position: relative;
        margin-bottom: 20px;
      }
      .common-header .brand h1 {
        margin: 0;
        font-size: 2.5em;
        color: #FF6A00;
      }
      .common-header .brand p {
        margin: 0;
        font-size: 1.1em;
        color: #333;
      }
      .common-header .home-btn {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(45deg, #FF6A00, #EE0979);
        color: #fff;
        padding: 10px 20px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: bold;
        transition: transform 0.2s ease;
      }
      .common-header .home-btn:hover {
        transform: translateY(-50%) scale(1.05);
      }
    </style>
  `;
}

/**
 * Helper function to convert color names to hex codes.
 * Extend this mapping as needed.
 */
function colorNameToHex(colorName) {
  const colors = {
    blue: "#AEC6CF",
    red: "#FF6961",
    purple: "#C3B1E1",
    green: "#77DD77",
    yellow: "#FDFD96"
  };
  return colors[colorName.toLowerCase()] || colorName;
}

/**
 * GET /generate/ - Redirect directly to the product details form.
 */
router.get('/', requireLogin, (req, res) => {
  res.redirect('/generate/form');
});

/**
 * GET /generate/form - Display the product details form.
 * The "Main Brand Color" field is empty so the user can type a color word.
 */
router.get('/form', requireLogin, (req, res) => {
  // Use no default color so the field is empty.
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Generate Payment Link - Novus</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          background: #FF6A00;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          background: #fff;
          padding: 30px;
          margin: 20px auto;
          border-radius: 15px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          max-width: 500px;
          width: 90%;
          text-align: left;
        }
        h2 {
          color: #FF6A00;
          margin-bottom: 20px;
          font-size: 2em;
          text-align: center;
        }
        label {
          display: block;
          margin: 10px 0 5px;
          font-weight: bold;
          color: #333;
        }
        input, textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1em;
        }
        .btn {
          display: block;
          width: 100%;
          padding: 10px;
          background: linear-gradient(45deg, #FF6A00, #EE0979);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1em;
          cursor: pointer;
          transition: transform 0.2s ease;
          margin-top: 10px;
          text-align: center;
        }
        .btn:hover {
          transform: scale(1.03);
        }
      </style>
    </head>
    <body>
      ${commonHeader()}
      <div class="container">
        <h2>Product Details</h2>
        <form action="/generate/generate-link" method="post">
          <label>Product/Service Name:</label>
          <input type="text" name="productName" required>
          <label>Description (optional):</label>
          <textarea name="description" rows="4"></textarea>
          <label>Price (in RWF):</label>
          <input type="number" name="price" required>
          <input type="hidden" name="currency" value="RWF">
          <label>Main Brand Color (type a color word, e.g., blue, red, purple):</label>
          <input type="text" name="mainBrandColor" placeholder="Enter a color (blue, red, purple...)" required>
          <button type="submit" class="btn">Generate Link</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

/**
 * POST /generate/generate-link - Process product details and generate a payment link.
 * Then display a confirmation page with Copy and QR Code buttons.
 * This page includes a header with "Go to Home".
 */
router.post('/generate-link', requireLogin, (req, res) => {
  const { productName, description, price } = req.body;
  const currency = "RWF";
  const email = req.session.user.personalEmail;
  
  // Convert the input color name (or hex) to a hex code using our helper.
  const mainBrandColorInput = req.body.mainBrandColor;
  const mainBrandColor = colorNameToHex(mainBrandColorInput);
  req.session.user.mainBrandColor = mainBrandColor;
  
  const { businessName, phone } = req.session.user;
  const linkId = Math.floor(Math.random() * 1000000);
  const link = `http://localhost:3000/generate/${linkId}`;
  
  global.links[linkId] = {
    email,
    businessName,
    phone,
    productName,
    description,
    price,
    currency,
    mainBrandColor
  };

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Link Generated - Novus</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          background: linear-gradient(135deg, #74ABE2, #5563DE);
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          background: #fff;
          padding: 30px;
          margin: 20px auto;
          border-radius: 15px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          max-width: 500px;
          width: 90%;
          text-align: center;
        }
        h1 {
          color: ${mainBrandColor};
          margin-bottom: 10px;
          font-size: 2em;
        }
        p {
          font-size: 1em;
          margin-bottom: 20px;
          color: #333;
        }
        a {
          color: #5563DE;
          text-decoration: none;
          font-weight: bold;
        }
        .btn {
          background: linear-gradient(45deg, #FF6A00, #EE0979);
          border: none;
          color: #fff;
          padding: 12px 20px;
          font-size: 1em;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s ease;
          margin: 10px;
        }
        .btn:hover {
          transform: scale(1.05);
        }
      </style>
    </head>
    <body>
      ${commonHeader()}
      <div class="container">
        <h1>Link Generated</h1>
        <p>Your Payment Link is: <a href="${link}">${link}</a></p>
        <button class="btn" onclick="copyLink()">Copy Link</button>
        <button class="btn" onclick="generateQRCode()">Generate QR Code</button>
        <div id="qrCodeContainer" style="margin-top:20px;"></div>
      </div>
      <script>
        function copyLink() {
          const dummyInput = document.createElement('input');
          dummyInput.value = "${link}";
          document.body.appendChild(dummyInput);
          dummyInput.select();
          document.execCommand('copy');
          document.body.removeChild(dummyInput);
          alert("Link copied to clipboard!");
        }
        function generateQRCode() {
          const qrCodeContainer = document.getElementById("qrCodeContainer");
          qrCodeContainer.innerHTML = '<img src="https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=' 
            + encodeURIComponent("${link}") + '" alt="QR Code">';
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * GET /generate/:id - Render landing page for the generated link using EJS template "landing.ejs"
 * This landing page does NOT include the header with "Go to Home".
 */
router.get('/:id', requireLogin, (req, res) => {
  const linkData = global.links[req.params.id];
  if (!linkData) {
    return res.send('Link not found.');
  }
  res.render('landing', {
    linkId: req.params.id,
    businessName: linkData.businessName,
    productName: linkData.productName,
    description: linkData.description,
    price: linkData.price,
    currency: linkData.currency,
    mainBrandColor: linkData.mainBrandColor
  });
});

module.exports = router;
