const express = require("express"); // express 모듈을 가져온다.
const router = express.Router(); // express 라우터 객체를 생성한다.
const authMiddleware = require("../middlewares/auth-middleware.js"); // "../middlewares/auth-middleware.js" 파일에서 인증 미들웨어를 가져온다.
const Comments = require("../schemas/comments.js"); // "../schemas/comments.js" 파일에서 Comments 스키마를 가져온다.
const Posts = require("../schemas/post.js"); // "../schemas/post.js" 파일에서 Posts 스키마를 가져온다

// 전체 댓글 조회 API
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comments.find() // Comments에서 모든 댓글을 조회하는데
      .select(" -__v") // "__v" 필드를 제외하고 조회한다
      .sort({ createdAt: -1 }); // createdAt을 기준으로 내림차순으로 정렬한다(최신순)
    res.json({ data: comments }); // JSON 형식으로 모든 댓글을 응답한다.
  } catch (error) {
    res.status(404).json({ error: "댓글 조회에 실패하였습니다." }); // HTTP 상태 코드를 404로 알리고 errorMessage를 json형식으로 응답한다.
  }
});

// 댓글 추가 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params; // req.params 객체에서 postId 값을 가져온다.
  const { content } = req.body; // 요청 body에서 content 값을 가져올 것이다.
  const { user } = res.locals; // 인증 미들웨어에서 가져온 사용자 정보를 사용한다.

  const existingComments = await Comments.findById(postId); // 주어진 postId로 댓글을 조회한다.
  if (!content) {
    // content가 없을 경우
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 내용을 입력해주세요.",
    }); // HTTP 상태 코드를 400으로 알리고 에러 메시지를 JSON 형식으로 응답한다.
  }

  const createdComments = await Comments.create({
    // Comments.create() 메소드를 사용하여 새로운 댓글을 생성한다.
    postId,
    userId: user.userId,
    nickname: user.nickname,
    content,
    createdAt: new Date(), // new Date()를 사용하여 현재의 날짜와 시간으로 설정한다.
  });

  res.status(201).json({ comments: "댓글을 작성하였습니다." }); // HTTP 상태 코드를 201로 알리고 댓글 작성 성공 메세지를 JSON 형식으로 응답한다.
});

// 댓글 수정 API
router.patch(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params; // req.params 객체에서 postId과 commentId 값을 가져온다.
    const { content } = req.body; // 요청 body에서 content 값을 가져올 것이다.
    const { user } = res.locals; // 인증 미들웨어에서 가져온 사용자 정보를 사용한다.

    try {
      // 게시글의 존재 여부를 확인한다.
      const post = await Posts.findById(postId);
      if (!post) {
        // 게시글이 존재하지 않는다면
        return res.status(404).json({ error: "게시글을 찾을 수 없습니다." }); // 404 상태 코드와 에러 메시지를 JSON 형식으로 응답한다.
      }

      // 댓글의 존재 여부를 확인한다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "댓글이 존재하지 않습니다." });
      }

      // 로그인 한 userId와 게시글 수정하려는 userId값이 같지 않다면
      if (user.userId !== existingComment.userId) {
        return res.status(403).json({ error: "접근이 허용되지 않습니다." });
      }

      // commentId로 댓글 존재 여부 확인한다.
      const comments = await Comments.findById(commentId); // commentId로 댓글 조회
      if (!comments) {
        // comments가 없을 경우
        return res.status(404).json({ error: "댓글이 존재하지 않습니다." }); // HTTP 상태 코드를 404로 알리고 json형태로 errorMessage를 받는다.
      }

      await Comments.updateOne({ _id: commentId }, { $set: { content } }); // Comments.updateOne() 메소드를 사용하여 commentId값을 기준으로 댓글을 수정한다. $set 연산자를 사용하여 content를 업데이트한다.
      res.status(200).json({ data: "댓글 수정에 성공했습니다." });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: "댓글 수정에 실패하였습니다." }); // 예외 처리를 하는데 HTTP 상태 코드를 404로 알리고 errorMessage를 json형태로 받는다.
    }
  }
);

// 댓글 삭제 API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params; // req.params 객체에서 postId과 commentId 값을 가져온다.
    const { user } = res.locals; // 인증 미들웨어에서 가져온 사용자 정보를 사용한다.

    try {
      // 게시물의 존재 여부를 확인한다.
      const post = await Posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
      }

      // 댓글의 존재 여부를 확인한다.
      const existingComment = await Comments.findById(commentId);
      if (!existingComment) {
        return res.status(404).json({ error: "댓글이 존재하지 않습니다." });
      }

      if (user.userId !== existingComment.userId) {
        return res.status(400).json({ error: "접근이 허용되지 않습니다." });
      }

      // 댓글을 삭제한다.
      await Comments.deleteOne(existingComment);

      res.status(200).json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      res.status(400).json({ error: "댓글 삭제에 실패했습니다." });
    }
  }
);

module.exports = router; // router객체를 모듈로 내보낸다
