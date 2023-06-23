const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');

const connect = require('./schemas');
connect();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/', [postsRouter, commentsRouter, usersRouter, loginRouter]);

app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸습니다.');
});
