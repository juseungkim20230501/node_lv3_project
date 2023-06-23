const express = require('express');
const router = express.Router();
const Posts = require('../schemas/posts');
const loginMiddleware = require('../middlewares/login-middleware');

// 전체 게시글 목록 조회
router.get('/posts', async (req, res) => {
  const post = await Posts.find({}, { __v: 0, content: 0 }).sort({
    createdAt: -1,
  });
  const viewPost = post.map((value) => {
    return {
      postId: value._id,
      userId: value.userId,
      nickname: value.nickname,
      title: value.title,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  });
  res.json({ posts: viewPost });
});

// 게시글 작성
router.post('/posts', loginMiddleware, async (req, res) => {
  try {
    const { userId, nickname } = res.locals.user;
    const { title, content } = req.body;
    await Posts.create({ userId, nickname, title, content });
    res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 상세 조회
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Posts.findOne({ _id: postId }, { __v: 0 });

    const viewPost = {
      postId: post._id,
      userId: post.userId,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
    res.json({ post: viewPost });
  } catch (err) {
    console.error(err);
    res.status(400).send({ errorMessage: '게시글 조회의 실패하였습니다.' });
  }
});

// 게시글 수정
router.put('/posts/:postId', loginMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  const existPost = await Posts.findOne({ _id: postId });
  if (existPost) {
    if (userId === existPost.userId) {
      await Posts.updateOne(
        { _id: postId },
        { $set: { title: title, content: content, updatedAt: new Date() } }
      );
      res.status(200).json({ message: '게시글을 수정하였습니다.' });
    } else {
      res.status(400).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
  }
});

// 게시글 삭제
router.delete('/posts/:postId', loginMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const [post] = await Posts.find({ _id: postId });

  if (!post) {
    return res
      .status(404)
      .json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  if (userId === post.userId) {
    await Posts.deleteOne({ _id: postId });
    return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  }
});

module.exports = router;
