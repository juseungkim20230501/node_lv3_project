const express = require('express');
const router = express.Router();
const userSchema = require('../schemas/user');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;

    const user = await userSchema.findOne({ nickname });

    if (!user || user.password !== password) {
      res.status(412).json({
        errorMessage: '닉네임 또는 패스워드를 확인해주세요.',
      });
      return;
    }
    const token = jwt.sign({ userId: user.userId }, 'letsgo-doge-key');

    res.cookie('Authorization', `Bearer ${token}`);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
  }
});

module.exports = router;
