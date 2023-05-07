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
const loginController = require("../controllers/auth/loginController");

//import middlewares
const verifyToken = require("../middlewares/verifier");

// Define routes for authentication

//self registration
router.post("/self-register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { savedUser, validationError } = await selfRegistration(
      name,
      email,
      password
    );
    if (validationError) {
      res.send(400).json(validationError);
    }
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
    const { savedUser, validationError } = await registration(
      name,
      email,
      password,
      creator
    );
    if (validationError) {
      res.send(400).json(validationError);
    }
    res.send("User registered successfully!");
  } catch (err) {
    res.status(400).send(err);
  }
});

//login
router.post("/login", async (req, res) => {

  await loginController(req, res);


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
  const user = await User.findById(req.user._id)?.populate(
    "created_by",
    "name"
  );
  if (!user) {
    return res.status(404).send("User not found!");
  }
  res.send(user);
});

//get all user
router.get("/users", verifyToken, async (req, res) => {
  const users = await User.find()?.populate("created_by", "name");
  res.set("User-Count", users?.length ?? 0);
  res.send(users);
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
