const express = require('express');
const router = express.Router();
const userSchema = require('../schemas/user');
const signupMiddleware = require('../middlewares/signup-middleware');

router.post('/signup', signupMiddleware, async (req, res) => {
  const { nickname, password } = req.body;
  const user = new userSchema({ nickname, password });
  await user.save();

  return res.status(201).json({
    message: '회원가입에 성공하였습니다.',
  });
});

module.exports = router;
