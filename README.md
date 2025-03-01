# Novus Payment Link Generator

Novus Payment Link Generator is a demo application built with Node.js, Express, and EJS that allows local entrepreneurs to generate custom payment links. The app supports multi‑step signup, product link generation, sales tracking, withdrawals, and more. It also integrates with Flutterwave for simulated payments and transfers.

## Features

- **User Authentication:** Sign up and log in using your personal email.
- **Multi‑Step Signup:** Collect personal and business details with a guided form.
- **Payment Link Generation:** Create product/service payment links with customizable branding.
  - Enter product details, price, and a main brand color (by name or hex).
  - Generate a unique payment link.
  - View a confirmation page with options to copy the link and generate a QR code.
- **Landing Page:** When a customer clicks the generated link, they see a landing page for checkout (with no "Go to Home" button).
- **Sales Tracking:** Record and view sales transactions, including customer details and timestamps.
- **Withdrawals & Balance:** View wallet balance, withdrawal history, and initiate fund transfers via Flutterwave.
- **Consistent Styling:** All pages use a consistent color scheme (with gradients matching login buttons) and responsive design.

## Project Structure

