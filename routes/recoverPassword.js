const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const userId = [];

// Reset password

router
  .post("/reset", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
      console.log(token);
      const url = `http://localhost:3000/user/reset/password?token=${token}`;
      const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f26f0f7e24bbde",
          pass: "80376b4b6d41b1",
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_PASSWORD,
        to: req.body.email,
        subject: "Recover your password",
        text: url,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.status(200).send("Email sent");
    } else {
      res.status(400).send("Email not found!");
    }
  })
  .post("/reset/password", async (req, res) => {
    try {
      const tokenUrl = req.query.token;
      const verified = jwt.verify(tokenUrl, process.env.TOKEN_SECRET);
      userId.push(verified.id);
    } catch (error) {
      res.status(400).send("Invalid token");
      console.log(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userExist = await User.findOneAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );
    if (!userExist) {
      res.status(400).send("Invalid update");
    } else {
      res.status(200).send("Password updated!");
    }
  });

module.exports = router;
