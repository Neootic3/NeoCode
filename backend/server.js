// node Modules
import express from "express";
import cors from "cors";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

// Custom.Modules
import { createUser, deleteUser, updateUser, verifyEmail, loginUser } from './services/userManager.js';
import { createRoom, getRoom, updateFile, deleteRoom, listUserRooms } from './services/roomManager.js';
import { sendEmail } from "./services/mailManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend/src")));

// Serve index.html
app.get("/", async (req, res) => {
  try {
    const html = await readFile(path.join(__dirname, "../frontend/src/index.html"), "utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot read index.html");
  }
});

app.get('/editor/:language', async (req, res) =>{
  try {
    const lang = req.params.language
    const html = await readFile(path.join(__dirname, "../frontend/src/editor.html"), "utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot read editor.html");
  }
});

app.get("/register", async (req, res) => {
  try {
    const html = await readFile(path.join(__dirname, "../frontend/src/pages/auth/register.html"), "utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot read register.html");
  }
});

app.get("/login", async (req, res) => {
  try {
    const html = await readFile(path.join(__dirname, "../frontend/src/pages/auth/login.html"), "utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot read login.html");
  }
});

app.get('/home', async (req, res) => {
  try {
    const html = await readFile(path.join(__dirname, "../frontend/src/pages/home.html"), "utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Cannot read home page");
  }
});

// Api Endpoints

app.get("/api/verify-login", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ loggedIn: false });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, user });
  } catch {
    res.json({ loggedIn: false });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.post("/api/run", async (req, res) => {
  const { code } = req.body;

  const dom = new JSDOM(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>`, {
    runScripts: "outside-only",
    resources: "usable"
  });

  const { window } = dom;
  const { document } = window;

  let output = "";

  // Capture console.log from jsdom
  window.console.log = (...args) => {
    output += args.join(" ") + "<br>";
  };

  try {
    // Run user code inside jsdom window
    window.eval(code);
  } catch (err) {
    output += `<span style="color:red;">${err}</span>`;
  }

  // Wrap in HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <link rel="stylesheet" href="css/preview.css">
  <style>
    body { font-family: monospace; background: #1e1e1e; color: #fff; padding: 10px; }
    span { color: red; }
  </style>
</head>
<body>
  <h3>Console Output</h3>
  <div>${output}</div>
  <hr>
  <h3>DOM Body</h3>
  <div>${document.body.innerHTML}</div>
</body>
</html>
`;

  res.send(html);
});

app.post("/api/createRoom", async (req, res) => {
  // WIP
});

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Data Validation
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: "Username must be at least 4 characters long." 
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email" 
      });
    }

    if (!password || password.length < 6 || password.toLowerCase().includes("password")) {
      return res.status(400).json({ 
        success: false, 
        message: "Password too weak" 
      });
    }

    // Create user
    const { user, verifyToken } = await createUser({ username, email, password });
    const emailName = email.split('@')[0];
    res.json({ success: true, user, verifyToken });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeoCode Verification Email</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      background-color: #f5f6fa;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5; /* NeoCode brand color */
      color: #ffffff;
      padding: 30px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      color: #111827;
      font-size: 20px;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #4f46e5;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer {
      padding: 20px 30px;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 620px) {
      .container {
        margin: 20px;
      }
      .content {
        padding: 20px;
      }
      .header {
        font-size: 20px;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      NeoCode Verification
    </div>
    <div class="content">
      <h2>Hello, ${emailName}</h2>
      <p>Thank you for signing up with <strong>NeoCode</strong>. To complete your registration and verify your email address, please click the button below:</p>
      <p style="text-align: center;">
        <a href="${verifyToken}" class="btn">Verify Email</a>
      </p>
      <i style="color: #9ca3af">If you did not request this email, you can safely ignore it.</i>
      <p>Welcome to the <b>NeoCode</b> community!</p>
      <p>Best regards,<br>SmallDevs Team</p>
    </div>
    <div class="footer">
      &copy; 2026 NeoCode. All rights reserved.
    </div>
  </div>
</body>
</html>`
    await sendEmail( email, "Verify Email", html)
  } catch (err) {
    console.log("Error Caught:", err.message)
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { user, token } = await loginUser({ email, password });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.log("Error Detected At /api/login:", err.message)
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/api/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const { success, user } = await verifyEmail(token);

    if (!success || !user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    res.json({ success: true, message: `Email verified for ${user.username}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});