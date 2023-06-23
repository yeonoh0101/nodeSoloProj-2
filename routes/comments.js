const express = require("express"); // express module을 express 변수에 할당
const router = express.Router(); // express.Router로 호출한다
const authMiddleware = require("../middlewares/auth-middleware.js");
const Comments = require("../schemas/comments.js"); // "../schemas/comments.js"를 불러온다
const Posts = require("../schemas/post.js");

// 전체 댓글 조회 API
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comments.find() // Comments에서 모든 댓글을 조회하는데
      .select(" -__v") // password와 __v 필드를 제외하고 조회한다
      .sort({ createdAt: -1 }); // createdAt을 기준으로 내림차순으로 정렬한다(최신순)
    res.json({ data: comments }); // json형태로 모든 댓글을 조회한다.
  } catch (error) {
    res.status(404).json({ error: "댓글 조회에 실패했습니다." }); // 예외 처리를 하는데 HTTP 상태 코드를 404로 알리고 errorMessage를 json형태로 받는다
  }
});

// 댓글 추가 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { user } = res.locals;

  const existingComments = await Comments.findById(postId); // 주어진 _id로 댓글을 조회한다
  if (!content) {
    // content가 없을 경우
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 내용을 입력해주세요.",
    }); // HTTP 상태 코드를 400으로 알리고 json형태로 errorMessage를 받는다.
  }

  const createdComments = await Comments.create({
    // Comments.create() 메소드를 사용하여 새로운 댓글을 생성한다.생성하는 댓글 내용을 createdComments 변수에 할당한다.
    postId,
    userId: user.userId,
    nickname: user.nickname,
    content,
    createdAt: new Date(), // new Date()를 사용하여 현재의 날짜와 시간으로 설정한다
  });

  res.json({ comments: "댓글 작성이 완료되었습니다." });
});

// 댓글 수정 API
router.patch(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const { user } = res.locals;

    try {
      // 게시물의 존재 여부를 확인합니다.
      const post = await Posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
      }
      // 코멘트의 존재 여부를 확인합니다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "코멘트를 찾을 수 없습니다." });
      }

      if (user.userId !== existingComment.userId) {
        return res.status(400).json({ error: "접근이 허용되지 않습니다." });
      }

      const comments = await Comments.findById(commentId); // commentId로 댓글 조회
      if (!comments) {
        // comments가 없을 경우
        return res
          .status(404)
          .json({ error: "해당하는 댓글을 찾을 수 없습니다." }); // HTTP 상태 코드를 404로 알리고 json형태로 errorMessage를 받는다.
      }

      await Comments.updateOne({ _id: commentId }, { $set: { content } }); // Comments.updateOne() 메소드를 사용하여 commentId와 password를 기준으로 댓글을 수정한다. $set 연산자를 사용하여 content를 업데이트한다.
      res.json({ data: "댓글 수정에 성공했습니다." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "댓글 수정에 실패했습니다." }); // 예외 처리를 하는데 HTTP 상태 코드를 404로 알리고 errorMessage를 json형태로 받는다.
    }
  }
);

// 코멘트 삭제 API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { user } = res.locals;

    try {
      // 게시물의 존재 여부를 확인합니다.
      const post = await Posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
      }

      // 코멘트의 존재 여부를 확인합니다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "코멘트를 찾을 수 없습니다." });
      }

      if (user.userId !== existingComment.userId) {
        return res.status(400).json({ error: "접근이 허용되지 않습니다." });
      }

      // 코멘트를 삭제합니다.
      await Comments.deleteOne(existingComment);

      res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      res.status(500).json({ error: "댓글 삭제에 실패했습니다." });
    }
  }
);

module.exports = router; // router객체를 모듈로 내보낸다
