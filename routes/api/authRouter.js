const express = require("express");
const {
  registerController,
  loginController,
  logoutController,
  currentUserController,
  updateSubscriptionController,
  updateAvatarController,
  verifyEmailController,
  resendEmailController,
} = require("../../controller/authController");
const validateRequestBody = require("../../validation/middlewares/validationRequestMiddleware");
const {
  schemaAuth,
  schemaUpdateSubscription,
  schemaVerifyEmail,
} = require("../../validation/createUserSchema");
const checkAuth = require("../../validation/middlewares/checkAuthMiddleware");
const upload = require("../../validation/middlewares/uploadAvatarMiddleware");

const router = express.Router();

router.post("/signup", validateRequestBody(schemaAuth), registerController);

router.post("/login", validateRequestBody(schemaAuth), loginController);

router.patch("/logout", checkAuth, logoutController);

router.get("/current", checkAuth, currentUserController);

router.patch(
  "/",
  validateRequestBody(schemaUpdateSubscription),
  checkAuth,
  updateSubscriptionController
);

router.patch(
  "/avatars",
  checkAuth,
  upload.single("avatar"),
  updateAvatarController
);

router.get("/verify/:verificationToken", verifyEmailController);

router.post(
  "/verify/",
  validateRequestBody(schemaVerifyEmail),
  resendEmailController
);

module.exports = router;
