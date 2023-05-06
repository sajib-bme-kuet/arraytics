const User = require("../models/User/User");
const bcrypt = require("bcrypt");

async function selfRegistration(name, email, password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });
  const validation = await user.validate();
  const savedUser = await user.save();
  return savedUser;
}

async function registration(name, email, password, created_by) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    created_by: created_by,
  });
  const validation = await user.validate();
  const savedUser = await user.save();
  return savedUser;
}

module.exports = { selfRegistration, registration };