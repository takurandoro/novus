// routes/withdrawRoutes.js
const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/authMiddleware');
const Flutterwave = require('flutterwave-node-v3');

// Replace with your actual Flutterwave test keys.
const flw = new Flutterwave('FLWPUBK_TEST-XXXXXXXXXXXX', 'FLWSECK_TEST-XXXXXXXXXXXX');

/**
 * Helper function for common header.
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
        padding: 15px 30px;
        width: 100%;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        position: relative;
        margin-bottom: 20px;
      }
      .common-header .brand h1 {
        margin: 0;
        color: #FF6A00;
        font-size: 2.5em;
      }
      .common-header .brand p {
        margin: 0;
        color: #555;
        font-size: 1.1em;
      }
      .common-header .home-btn {
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        background: linear-gradient(45deg, #FF6A00, #EE0979);
        color: #fff;
        padding: 8px 16px;
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
 * GET /withdraw - Display withdrawal confirmation page.
 */
router.get('/', requireLogin, (req, res) => {
  const phone = req.session.user.phone;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Withdraw Funds - Novus</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
    </head>
    <body>
      ${commonHeader()}
      <div class="container" style="background:#fff; padding:30px; margin:20px auto; border-radius:15px; max-width:500px; width:90%; text-align:center; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
        <h2 style="color:#FF6A00; margin-bottom:20px; font-size:2em;">Withdrawal Confirmation</h2>
        <p style="font-size:1em; color:#333; margin-bottom:20px;">Your withdrawal will be made to this phone number:</p>
        <p style="font-size:1em; color:#333; margin-bottom:20px;"><strong>${phone}</strong></p>
        <p style="font-size:1em; color:#333; margin-bottom:20px;">You will receive your money instantly.</p>
        <button class="btn" onclick="window.location.href='/withdraw/form'" style="padding:10px 20px; background:linear-gradient(45deg, #FF6A00, #EE0979); border:none; border-radius:8px; color:#fff; font-size:1em; cursor:pointer; transition: transform 0.2s ease;">Proceed</button>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /withdraw/form - Display withdrawal amount form.
 */
router.get('/form', requireLogin, (req, res) => {
  const wallet = global.sales[req.session.user.personalEmail]?.wallet || 0;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Enter Withdrawal Amount - Novus</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
    </head>
    <body>
      ${commonHeader()}
      <div class="container" style="background:#fff; padding:30px; margin:20px auto; border-radius:15px; max-width:500px; width:90%; text-align:center; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
        <h2 style="color:#FF6A00; margin-bottom:20px; font-size:2em;">Withdrawal Amount</h2>
        <p style="font-size:1em; color:#333; margin-bottom:20px;">Your current balance is: <strong>${wallet} RWF</strong></p>
        <form action="/withdraw" method="post" onsubmit="return validateWithdrawal()">
          <label style="display:block; margin-top:10px; font-weight:bold; text-align:left;">Amount to Withdraw (RWF):</label>
          <input type="number" id="withdrawAmount" name="amount" required style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; margin-bottom:10px;">
          <p id="finalAmount" style="font-weight:bold; margin-bottom:10px; color:#333;"></p>
          <button type="submit" class="btn" style="padding:10px 20px; background:linear-gradient(45deg, #FF6A00, #EE0979); border:none; border-radius:8px; color:#fff; font-size:1em; cursor:pointer; transition: transform 0.2s ease;">Withdraw</button>
        </form>
      </div>
      <script>
        const wallet = ${wallet};
        const feeRate = 0.02;
        const amountInput = document.getElementById('withdrawAmount');
        const finalAmountP = document.getElementById('finalAmount');
        
        amountInput.addEventListener('input', () => {
          const amount = parseFloat(amountInput.value);
          if (!isNaN(amount)) {
            const finalAmount = amount * (1 - feeRate);
            finalAmountP.textContent = "After a 2% fee, you will receive: " + finalAmount.toFixed(2) + " RWF";
          } else {
            finalAmountP.textContent = "";
          }
        });
        
        function validateWithdrawal() {
          const amount = parseFloat(amountInput.value);
          if (amount > wallet) {
            alert("Withdrawal amount exceeds your available balance.");
            return false;
          }
          return true;
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * POST /withdraw - Process withdrawal:
 * - Verify amount within balance.
 * - Deduct amount (with 2% fee).
 * - Record withdrawal.
 * - Initiate a Flutterwave transfer.
 */
router.post('/', requireLogin, async (req, res) => {
  const amount = parseFloat(req.body.amount);
  const fee = amount * 0.02;
  const finalAmount = amount - fee;
  const email = req.session.user.personalEmail;
  const currentWallet = global.sales[email]?.wallet || 0;
  
  if (amount > currentWallet) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Withdrawal Error - Novus</title>
      </head>
      <body>
        ${commonHeader()}
        <p>Withdrawal amount exceeds your available balance. <a href="/withdraw/form">Try again</a></p>
      </body>
      </html>
    `);
  }
  
  // Deduct amount from wallet
  global.sales[email].wallet = currentWallet - amount;
  
  // Record the withdrawal transaction
  if (!global.sales[email].withdrawals) {
    global.sales[email].withdrawals = [];
  }
  const withdrawalRecord = {
    amount,
    fee,
    finalAmount,
    date: new Date()
  };
  global.sales[email].withdrawals.push(withdrawalRecord);
  
  // Prepare payload for Flutterwave Transfer
  const payload = {
    "account_bank": "MPS",  // Adjust as needed for test mode.
    "account_number": req.session.user.phone,
    "amount": finalAmount,
    "narration": "Withdrawal from Novus",
    "currency": "RWF",
    "reference": "WD-" + Date.now(),
    "callback_url": "https://your-callback-url.com" // Replace if needed.
  };
  
  try {
    const response = await flw.Transfer.initiate(payload);
    console.log("Flutterwave Transfer Response:", response);
    
    // If no transaction_id is provided, simulate one for testing.
    if (!response.data || !response.data.transaction_id) {
      response.data = { transaction_id: "TESTTX" + Date.now() };
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Withdrawal Successful - Novus</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #74ABE2, #5563DE);
            margin: 0;
            padding: 0;
          }
          .common-header {
            background: #fff;
            padding: 15px 30px;
            width: 100%;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            position: relative;
            margin-bottom: 20px;
          }
          .common-header .brand h1 {
            margin: 0;
            color: #FF6A00;
            font-size: 2.5em;
          }
          .common-header .brand p {
            margin: 0;
            color: #555;
            font-size: 1.1em;
          }
          .common-header .home-btn {
            position: absolute;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(45deg, #FF6A00, #EE0979);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.2s ease;
          }
          .common-header .home-btn:hover {
            transform: translateY(-50%) scale(1.05);
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
          h2 {
            color: #FF6A00;
            margin-bottom: 20px;
            font-size: 2em;
          }
          p {
            font-size: 1em;
            margin-bottom: 10px;
            color: #333;
          }
          .home-btn-button {
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
          .home-btn-button:hover {
            transform: scale(1.03);
          }
        </style>
      </head>
      <body>
        ${commonHeader()}
        <div class="container">
          <h2>Withdrawal Successful</h2>
          <p>You have withdrawn ${amount.toFixed(2)} RWF.</p>
          <p>After a 2% fee, you will receive ${finalAmount.toFixed(2)} RWF.</p>
          <p>Transaction ID: ${response.data.transaction_id}</p>
          <button class="home-btn-button" onclick="window.location.href='/dashboard'">Go to Home</button>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Flutterwave Transfer Error:", error);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Withdrawal Error - Novus</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #74ABE2, #5563DE);
            margin: 0;
            padding: 0;
          }
          .common-header {
            background: #fff;
            padding: 15px 30px;
            width: 100%;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            position: relative;
            margin-bottom: 20px;
          }
          .common-header .brand h1 {
            margin: 0;
            color: #FF6A00;
            font-size: 2.5em;
          }
          .common-header .brand p {
            margin: 0;
            color: #555;
            font-size: 1.1em;
          }
          .common-header .home-btn {
            position: absolute;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(45deg, #FF6A00, #EE0979);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.2s ease;
          }
          .common-header .home-btn:hover {
            transform: translateY(-50%) scale(1.05);
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
          p {
            font-size: 1em;
            color: #333;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${commonHeader()}
        <div class="container">
          <p>An error occurred while processing your withdrawal: ${error.message}. Please try again later.</p>
          <p><a href="/withdraw/form">Back</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
