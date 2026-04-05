const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    
    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed - Invalid Token</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }

            .container {
              max-width: 500px;
              width: 100%;
            }

            .card {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border-radius: 24px;
              padding: 40px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
              text-align: center;
              border: 1px solid rgba(255, 255, 255, 0.2);
              transform: translateY(0);
              transition: transform 0.3s ease;
            }

            .card:hover {
              transform: translateY(-5px);
            }

            .icon-container {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 25px;
            }

            .icon-container.success {
              background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            }

            .icon {
              color: white;
              font-size: 36px;
            }

            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 15px;
              color: #1f2937;
              background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .message {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
            }

            .actions {
              display: flex;
              flex-direction: column;
              gap: 15px;
              margin-top: 30px;
            }

            .btn {
              padding: 16px 32px;
              border-radius: 12px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              transition: all 0.3s ease;
              cursor: pointer;
              border: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }

            .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }

            .btn-secondary {
              background: transparent;
              color: #667eea;
              border: 2px solid #e5e7eb;
            }

            .btn-secondary:hover {
              border-color: #667eea;
              background: rgba(102, 126, 234, 0.05);
            }

            .loader {
              display: none;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s ease-in-out infinite;
              margin: 0 auto;
            }

            @keyframes spin {
              to { transform: rotate(360deg); }
            }

            .status-animation {
              animation: pulse 2s infinite;
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.8; }
            }

            /* Responsive Design */
            @media (max-width: 640px) {
              .card {
                padding: 30px 25px;
              }
              
              h1 {
                font-size: 24px;
              }
              
              .icon-container {
                width: 70px;
                height: 70px;
              }
              
              .icon {
                font-size: 30px;
              }
            }

            @media (max-width: 480px) {
              .card {
                padding: 25px 20px;
              }
              
              h1 {
                font-size: 22px;
              }
              
              .btn {
                padding: 14px 24px;
                font-size: 15px;
              }
            }

            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="icon-container">
                <i class="icon fas fa-exclamation-triangle"></i>
              </div>
              <h1>Invalid Verification Link</h1>
              <div class="message">
                <p>The verification link you used is invalid or has expired.</p>
              
              </div>
             
            </div>
           
          </div>
        </body>
        </html>
      `);
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified Successfully</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }

          .container {
            max-width: 500px;
            width: 100%;
          }

          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transform: translateY(0);
            transition: transform 0.3s ease;
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card:hover {
            transform: translateY(-5px);
          }

          .icon-container {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 25px;
            animation: scaleIn 0.5s ease-out 0.3s both;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .icon {
            color: white;
            font-size: 36px;
          }

          .checkmark {
            width: 40px;
            height: 40px;
            stroke-width: 2;
            stroke: #ffffff;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
          }

          h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #1f2937;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: fadeIn 0.8s ease-out 0.5s both;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            animation: fadeIn 0.8s ease-out 0.7s both;
          }

          .user-info {
            background: #f3f4f6;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: left;
            animation: fadeIn 0.8s ease-out 0.9s both;
          }

          .info-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
          }

          .info-item:last-child {
            margin-bottom: 0;
          }

          .info-icon {
            color: #667eea;
            font-size: 16px;
            width: 20px;
          }

          .actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 30px;
            animation: fadeIn 0.8s ease-out 1.1s both;
          }

          .btn {
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }

          .btn-secondary {
            background: transparent;
            color: #667eea;
            border: 2px solid #e5e7eb;
          }

          .btn-secondary:hover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
          }

          .countdown {
            margin-top: 15px;
            font-size: 14px;
            color: #9ca3af;
            animation: fadeIn 0.8s ease-out 1.3s both;
          }

          /* Responsive Design */
          @media (max-width: 640px) {
            .card {
              padding: 30px 25px;
            }
            
            h1 {
              font-size: 24px;
            }
            
            .icon-container {
              width: 70px;
              height: 70px;
            }
            
            .checkmark {
              width: 35px;
              height: 35px;
            }
            
            .actions {
              flex-direction: column;
            }
            
            .btn {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .card {
              padding: 25px 20px;
            }
            
            h1 {
              font-size: 22px;
            }
            
            .btn {
              padding: 14px 24px;
              font-size: 15px;
            }
            
            .user-info {
              padding: 15px;
            }
          }

          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            animation: fadeIn 0.8s ease-out 1.5s both;
          }

          .footer a {
            color: white;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="icon-container success">
              <svg class="checkmark" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h1>Email Verified Successfully!</h1>
            <div class="message">
              <p>Congratulations! Your email has been verified.</p>
              <p>You can now access all features of your account.</p>
            </div>
            
           
            
          
            
          
          </div>
          
        
        </div>

        <script>
          // Countdown redirect
          let seconds = 10;
          const timerElement = document.getElementById('timer');
          const countdown = setInterval(() => {
            seconds--;
            timerElement.textContent = seconds;
            
            if (seconds <= 0) {
              clearInterval(countdown);
              window.location.href = '/login';
            }
          }, 1000);

          // Stop countdown if user interacts
          document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
              clearInterval(countdown);
              document.getElementById('countdown').style.opacity = '0.5';
            });
          });

          // Animate checkmark
          const checkmark = document.querySelector('.checkmark__check');
          const circle = document.querySelector('.checkmark__circle');
          
          setTimeout(() => {
            checkmark.style.strokeDasharray = '1000';
            checkmark.style.strokeDashoffset = '1000';
            checkmark.style.animation = 'dash 2s ease-out forwards';
            
            circle.style.strokeDasharray = '1000';
            circle.style.strokeDashoffset = '1000';
            circle.style.animation = 'dash 1.5s ease-out forwards 0.5s';
          }, 500);

          // Add CSS animation for checkmark
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes dash {
              to {
                stroke-dashoffset: 0;
              }
            }
          \`;
          document.head.appendChild(style);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
            text-align: center;
          }
          
          .error-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
          }
          
          h1 {
            margin-bottom: 20px;
          }
          
          a {
            color: white;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>Something went wrong</h1>
          <p>We encountered an error while processing your verification. Please try again later.</p>
          <p><a href="/">Return to Home</a></p>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;