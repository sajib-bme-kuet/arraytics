// Import required packages
const router = require("express").Router();
const User = require("../models/User/User");
const jwt = require("jsonwebtoken");
//Load environment Variables
require("dotenv");

//import controllers
const {
  selfRegistration,
  registration,
} = require("../controllers/auth/registrationController");
const login = require("../controllers/auth/loginController");

//import middlewares
const verifyToken = require("../middlewares/verifier");

// Define routes for authentication

//self registration
router.post("/self-register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const savedUser = await selfRegistration(name, email, password);
    res.send("User registered successfully!");
  } catch (err) {
    res.status(400).send(err);
  }
});

//User registers another user
router.post("/register", verifyToken, async (req, res) => {
  const { name, email, password } = req.body;
  const creator = req.user._id;
  try {
    const savedUser = await registration(name, email, password, creator);
    res.send("User registered successfully!");
  } catch (err) {
    res.status(400).send(err);
  }
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await login(email, password);

  //send response
  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "none", // Set to 'lax' or 'strict' if needed
      secure: true, // Set to true if using HTTPS
      expires: new Date(Date.now() + 15 * 60 * 1000), // cookie will be removed after 15 minutes
    })
    .send({ message: "Logged in successfully!", refreshToken });
});

//logout
router.get("/logout", async (req, res) => {
  res
    .cookie("access_token", "", {
      httpOnly: true,
      sameSite: "none", // Set to 'lax' or 'strict' if needed
      secure: true, // Set to true if using HTTPS
    })
    .send("Logged Out successfully!");
});

//get user
router.get("/user", verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).send("User not found!");
  }
  res.send(user);
});

//refresh accessToken if expired
router.post("/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).send("Refresh token not found!");
  }

  try {
    const token = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    const accessToken = generateAccessToken(token._id);
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        sameSite: "none", // Set to 'lax' or 'strict' if needed
        secure: true, // Set to true if using HTTPS
        expires: new Date(Date.now() + 15 * 60 * 1000), // cookie will be removed after 15 minutes
      })
      .send({ message: "Access Token Regenerated successfully!" });
  } catch {
    res.status(401).send("Refresh token is invalid!");
  }
});

module.exports = router;
