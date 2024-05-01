export const WELCOME_MAIL_TEMPLATE =`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Message</title>
    <style>
        @keyframes zoomIn {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
        }
        .mail-container {
            background-color: #ffffff;
            max-width: 90%;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 10px 50px rgba(0, 0, 0, 0.1);
        }
        .mail-header {
            position: relative; /* Using relative positioning for pseudo-elements */
            background-color: #45226f;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            overflow: hidden; /* Containment for pseudo-elements */
        }
        
        /* Bubble pattern using pseudo-element */
        .mail-header::before {
            content: '';
            position: absolute;
            top: -100px; /* Slightly move the pattern up */
            left: 0;
            width: 100%;
            height: 200%;
            background-image: radial-gradient(circle, #9752FC  20%, transparent 20%),
                              radial-gradient(circle, transparent 20%, #9752FC  20%, transparent 30%),
                              radial-gradient(circle, #9752FC  20%, transparent 20%);
            background-size: 100px 100px; /* Change the size of the bubbles */
            background-position: 0 0, 50px 50px, 100px 0;
            z-index: 0; /* Send the pattern to the back */
        }

        .mail-header h1 {
            position: relative;
            margin: 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            /* Ensuring the text appears above the pattern */
            z-index: 1;
        }

        .mail-body {
            padding: 20px;
        }
        .mail-body p {
            line-height: 1.6;
        }
        .mail-body .anc {
            display: inline-block;
            padding: 10px 20px;
            background-color: #333;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            transition: 0.3s;
        }
        .mail-body a:hover {
            animation: zoomIn 1.5s ease-in-out infinite;
        }
        .footer-content {
            font-size: 12px;
            color: #666666;
            text-align: left;
        }
    </style>
    <style>
        @keyframes zoomIn {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f0f0f0;
        }
        .mail-container {
            position: relative;
            background-color: #ffffff;
            max-width: 600px; /* Set a fixed max-width for better control */
            width: 100%;
            margin: 20px;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            z-index: 1;
        }
        .mail-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: -1;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(147, 82, 254, 0.2) 30%, transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(147, 82, 254, 0.2) 50%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(147, 82, 254, 0.2) 40%, transparent 40%);
            background-repeat: no-repeat;
            background-position: 0 0, center, 100% 100%;
            pointer-events: none; /* Stops the pseudo-element from blocking clicks */
        }
        /* ...the rest of your CSS... */
    </style>
</head>
<body>
    <div class="mail-container">
        <header class="">
            <h1>Welcome to zauto<span style="color: #9752FC ;">ai</span></h1>
        </header>
        <section class="mail-body">
            <h2>Thanks for signing up, {{name}}!</h2>
            <p>You're on the way to setting up your ZautoAI account. We just need to verify your email.</p>
            <p>Click the button below to let us know it's really you.</p>
            <p>Please note, this link is only valid for 24 hours.</p>
            <a href="{{link}}" class="anc" style="background: #45226f;">Verify Email Address</a><br/>
            <p>If that doesn't work, copy and paste the following link in your browser:</p>
            <p><a href="{{link}}"><i>{{link}}</i></a></p>
            <br/>
            <h4>Excited to Have You Onboard,</h4>
            <h4>Giridharan Palanisamy,</h4>
            <h5>Founder of ZautoAI</h5>
        </section>
        <hr/>
        <footer class="footer-content">
            
            <p>If you have any questions, just email us at giri@zautoai.com</p>
            <p>No-D, First floor, Ragaganapathi Complex, Mullai Nager, Salem, TN, India, PIN 636005</p>
        </footer>
    </div>
</body>
</html>` 