export const SIGNUP_MAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New User Signup Alert</title>
  <style>
    /* Basic styling for email */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    h1, p {
      text-align: center;
    }
    .primary-btn {
      display: inline-block;
      background: #A24EFF;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
    .primary-btn:hover {
      background: #7A33E2;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #A24EFF;">New User Signup Alert</h1>
    <p>Dear Admin,</p>
    <p>We would like to inform you that a new user has signed up for our service. Below are the details:</p>
    <ul>
      <li><strong>Name:</strong> {{username}}</li>
      <li><strong>Email:</strong> {{useremail}}</li>
      <li><strong>Date of Signup:</strong> {{createdAt}}</li>
    </ul>
    <p>Please take necessary actions to welcome the new user and ensure a smooth onboarding process.</p>
    <p>Best regards,<br>ZautoAI Team</p>
  </div>
</body>
</html>
`