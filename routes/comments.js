const express = require("express"); // express module을 express 변수에 할당
const router = express.Router(); // express.Router로 호출한다
const Posts = require("../schemas/post.js"); // "../schemas/post.js"를 불러온다
const Comments = require("../schemas/comments.js"); // "../schemas/comments.js"를 불러온다

// 전체 댓글 조회 API
router.get("/posts/:_id/comments", async (req, res) => {
  try {
    const comments = await Comments.find() // Comments에서 모든 댓글을 조회하는데
      .select("-password -__v") // password와 __v 필드를 제외하고 조회한다
      .sort({ createdAt: -1 }); // createdAt을 기준으로 내림차순으로 정렬한다(최신순)
    res.json({ data: comments }); // json형태로 모든 댓글을 조회한다.
  } catch (error) {
    res.status(404).json({ error: "댓글 조회에 실패했습니다." }); // 예외 처리를 하는데 HTTP 상태 코드를 404로 알리고 errorMessage를 json형태로 받는다
  }
});

// 댓글 추가 API
router.post("/posts/:_id/comments", async (req, res) => {
  const { _id } = req.params;
  const { user, password, content } = req.body;

  const existingComments = await Comments.findById(_id); // 주어진 _id로 댓글을 조회한다
  if (!content) {
    // content가 없을 경우
    return res.status(400).json({
      success: false,
      errorMessage: "댓글 내용을 입력해주세요.",
    }); // HTTP 상태 코드를 400으로 알리고 json형태로 errorMessage를 받는다.
  }

  const createdComments = await Comments.create({
    // Comments.create() 메소드를 사용하여 새로운 댓글을 생성한다.생성하는 댓글 내용을 createdComments 변수에 할당한다.
    commentId: _id,
    user,
    password,
    content,
    createdAt: new Date(), // new Date()를 사용하여 현재의 날짜와 시간으로 설정한다
  });

  res.json({ comments: "댓글 작성이 완료되었습니다." });
});

// 댓글 수정 API
router.put("/posts/:_id/comments/:_commentid", async (req, res) => {
  const { _commentId } = req.params;
  const { password, content } = req.body;

  try {
    const comments = await Comments.findOne({ _commentId, password }); // _commentId와 password로 댓글 조회
    if (!comments) {
      // comments가 없을 경우
      return res
        .status(404)
        .json({ error: "해당하는 댓글을 찾을 수 없습니다." }); // HTTP 상태 코드를 404로 알리고 json형태로 errorMessage를 받는다.
    }
    await Comments.updateOne({ _commentId, password }, { $set: { content } }); // Comments.updateOne() 메소드를 사용하여 _commentId와 password를 기준으로 댓글을 수정한다. $set 연산자를 사용하여 content를 업데이트한다.
    res.json({ data: "댓글 수정에 성공했습니다." });
  } catch (error) {
    res.status(500).json({ error: "댓글 수정에 실패했습니다." }); // 예외 처리를 하는데 HTTP 상태 코드를 404로 알리고 errorMessage를 json형태로 받는다.
  }
});

module.exports = router; // router객체를 모듈로 내보낸다
