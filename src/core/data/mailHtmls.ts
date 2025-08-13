export const otpHtml = (otp: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Your OTP Code</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
      .container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);}
      .otp { font-size: 2em; color: #007bff; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Your OTP Code</h2>
      <p>Please use the following code to complete your registration:</p>
      <div class="otp">${otp}</div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  </body>
</html>
`