const express = require('express');
const router = express.Router();
const Posts = require('../schemas/posts');
const Comments = require('../schemas/comments');
const loginMiddleware = require('../middlewares/login-middleware');

// 댓글 목록 조회
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comment = await Comments.find({ postId: postId });
    const viewComment = comment.map((value) => {
      return {
        commentId: value._id,
        userId: value.userId,
        nickname: value.nickname,
        comment: value.comment,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
    });
    res.json({ comments: viewComment });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: '댓글 조회에 실패하였습니다.' });
  }
});

// 댓글 작성
router.post('/posts/:postId/comments', loginMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(412).json({
      errorMessage: '댓글 내용을 입력해주세요',
    });
  }
  await Comments.create({ userId, nickname, postId, comment });
  return res.status(201).json({ message: '댓글을 작성하였습니다.' });
});

// 댓글 수정
router.put(
  '/posts/:postId/comments/:commentId',
  loginMiddleware,
  async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const { postId, commentId } = req.params;
      const { comment } = req.body;

      const post = await Posts.findOne({ _id: postId });
      const comments = await Comments.findOne({ _id: commentId });

      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: '게시글이 존재하지 않습니다.' });
      }
      if (!comment) {
        return res
          .status(404)
          .json({ errorMessage: '댓글이 존재하지 않습니다.' });
      }
      if (userId === comments.userId) {
        if (!comment) {
          return res
            .status(412)
            .json({ errorMessage: '댓글 내용을 입력해주세요.' });
        }
        await Comments.updateOne(
          { _id: commentId },
          { $set: { comment: comment, updatedAt: new Date() } }
        );
        return res.status(200).json({ Message: '댓글을 수정하였습니다.' });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
  }
);

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', loginMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const post = await Posts.findOne({ _id: postId });
    const comment = await Comments.findOne({ _id: commentId });

    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }
    if (!comment) {
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    }
    if (userId === comment.userId) {
      await Comments.deleteOne({ _id: commentId });
      return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } else {
      return res.status(404).json({ message: '비밀번호가 다릅니다.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});

module.exports = router;
