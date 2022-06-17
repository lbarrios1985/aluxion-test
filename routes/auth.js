const router = require('express').Router();
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register request

router.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if a user is already registered
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send('This email has been already registered!');

  // Checking if username is already registered

  const userNameExist = await User.findOne({ username: req.body.username });
  if (userNameExist)
    return res.status(400).send('This username is already taken!');

  // Hashing the password

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Creating a new User
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  });

  try {
    const savedUser = await user.save();
    res.send('Succesfully registered!');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login request

router.post('/login', async (req, res) => {
  // Validation
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user exists

  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send('Wrong email or password!');

  // Checking the password

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password!');

  // Creating a token and assigning to the user

  const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
  res.send({'auth-token':token})
});

module.exports = router;
