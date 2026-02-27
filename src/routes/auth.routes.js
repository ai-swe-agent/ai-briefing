const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../middleware/validate');
const authenticate = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

module.exports = router;
