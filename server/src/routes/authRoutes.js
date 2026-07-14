const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const {
  adminLoginSchema,
  participantRegisterSchema,
  participantLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/admin/login', validate(adminLoginSchema), authController.adminLogin);
router.post('/participant/register', validate(participantRegisterSchema), authController.participantRegister);
router.post('/participant/login', validate(participantLoginSchema), authController.participantLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
