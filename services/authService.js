const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs/promises");
const User = require("../models/user");
const sendEmail = require("../helpers/sendEmail");
const createError = require("../helpers/createError");

require("dotenv").config();

const register = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({ email });

  if (user) {
    throw createError(409, "Email in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const verificationToken = uuidv4();

  sendEmail({
    to: email,
    subject: "Verification of email",
    html: `<p>Please, <a href="http://localhost:3000/users/verify/${verificationToken}" target="_blank"> confirm your email </a><p>`,
  });

  const userNew = await User.create({
    email,
    password: hash,
    avatarURL: gravatar.url(email),
    verify: false,
    verificationToken,
  });

  return userNew;
};

const login = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(401, "Email or password is wrong");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw createError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw createError(400, "Verify your email");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  const userAfterTokenUpdate = await User.findByIdAndUpdate(
    user.id,
    { token },
    { new: true }
  );

  return userAfterTokenUpdate;
};

const logout = async (id) => {
  await User.findByIdAndUpdate(id, { token: "" });
};

const getCurrentUser = async (id) => {
  return User.findById(id);
};

const updateSubscription = async (id, subscription) => {
  const userAfterSubscriptionUpdate = User.findByIdAndUpdate(
    id,
    { subscription },
    { new: true }
  );
  return userAfterSubscriptionUpdate;
};

const uploadAvatar = async (id, data) => {
  const { path: tempDir, originalname = "" } = data;
  const [extension] = originalname.split(".").reverse();
  const newFileName = `${id}.${extension}`;
  const uploadDir = path.join(
    __dirname,
    "../",
    "public",
    "avatars",
    newFileName
  );

  await fs.rename(tempDir, uploadDir);

  const user = await User.findByIdAndUpdate(
    id,
    { avatarURL: path.join("avatars", newFileName) },
    { new: true }
  );
  return user;
};

const verifyEmail = async (verificationToken) => {
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw createError(404, "User not found");
  }

  await User.findByIdAndUpdate(user.id, {
    verificationToken: null,
    verify: true,
  });
};

const resendEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createError(401, "Email is wrong");
  }

  if (user.verify) {
    throw createError(400, "Verification has already been passed");
  }

  sendEmail({
    to: email,
    subject: "Verification of email",
    html: `<p>Please, <a href="http://localhost:3000/users/verify/${user.verificationToken}" target="_blank"> confirm your email </a><p>`,
  });
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateSubscription,
  uploadAvatar,
  verifyEmail,
  resendEmail,
};
