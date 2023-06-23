const express = require("express"); // express module을 express 변수에 할당
const router = express.Router(); // express.Router로 호출한다
const authMiddleware = require("../middlewares/auth-middleware.js");
const Posts = require("../schemas/post.js"); // "../schemas/post.js"를 불러온다

// 전체 게시글 조회 API
router.get("/posts", async (req, res) => {
  // "/posts" 경로에 대한 GET 요청을 보낸다
  try {
    const posts = await Posts.find({}) // Posts에서 모든 게시글을 조회한다
      .select(" -__v") // password, content, __v 필드를 제외하고 조회한다.
      .sort({ createdAt: -1 }); // createdAt 필드를 기준으로 내림차순으 정렬한다(최신순)
    res.json({ data: posts }); // 조회된 게시글을 JSON 형식으로 응답한다
  } catch (error) {
    res.status(400).json({ error: "게시글 조회에 실패했습니다." }); // 오류가 발생한다면 json형식으로 error메세지를 보여준다.
  }
});

// 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  // "/posts" 경로에 대한 POST 요청을 보낸다.
  const { title, content } = req.body;
  const { user } = res.locals;
  console.log(user);

  const createdPosts = await Posts.create({
    // Posts.create() 메소드를 사용하여 새로운 게시글을 생성한다.생성하는 게시글 내용을 createdPosts 변수에 할당한다.
    userId: user.userId,
    nickname: user.nickname,
    title,
    content,
    createdAt: new Date(), // new Date()를 사용하여 현재의 날짜와 시간으로 설정한다.
  });

  res.status(201).json({ posts: "게시글을 생성하였습니다." });
});

// 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  // "/posts/:_id" 경로에 대한 GET 요청을 보낸다.
  const { postId } = req.params;
  try {
    const posts = await Posts.findById(postId) // _id에 해당하는 게시물을 조회한다
      .select(" -__v") // __v 필드를 제외하고 조회한다
      .sort({ createdAt: -1 }); // createdAt 필드를 기준으로 내림차순 정렬한다.
    if (!posts) {
      // 게시글이 없는경우
      return res
        .status(400)
        .json({ error: "해당하는 게시글을 찾을 수 없습니다." });
    } // HTTP 상태 코드를 404로 알리고 json형태로 errorMessage를 받는다.
    res.json({ data: posts }); // 조회된 게시물을 JSON 형식으로 보여준다
  } catch (error) {
    res.status(400).json({ error: "게시글 조회에 실패했습니다." });
  } // 오류가 발생한다면 json형식으로 error메세지를 보여준다.
});

// 게시글 수정 API
router.patch("/posts/:postId", authMiddleware, async (req, res) => {
  // "/posts/:_id" 경로에 대한 PUT 요청을 보낸다.
  const { postId } = req.params;
  const { user } = res.locals;
  const { title, content } = req.body;
  console.log(title, content, postId, user);
  try {
    const posts = await Posts.findById(postId); // postId와 password에 해당하는 게시물을 조회한다
    if (!posts) {
      // 게시글이 없다면
      return res
        .status(404)
        .json({ error: "해당하는 게시글을 찾을 수 없습니다." }); // 게시물이 없거나 비밀번호가 일치하지 않는 경우 오류 응답을 한다
    }
    if (posts.userId !== user.userId) {
      return res
        .status(400)
        .json({ error: "게시글 수정의 권한이 존재하지 않습니다." });
    }
    await Posts.updateOne({ _id: postId }, { $set: { title, content } }); // 게시물 수정한 것 업데이트
    res.json({ data: "게시글 수정에 성공했습니다." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "게시글 수정에 실패했습니다." }); // 오류가 발생한 경우 오류메세지를 보여준다.
  }
});

// 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { user } = res.locals;

  try {
    const posts = await Posts.findById(postId); // postId에 해당하는 게시물을 조회
    if (!posts) {
      return res.status(404).json({ error: "게시글이 존재하지 않습니다." }); // 게시물이 없는 경우 오류메세지를 보여준다.
    }
    if (posts.userId !== user.userId) {
      return res
        .status(403)
        .json({ error: "게시글의 삭제 권한이 존재하지 않습니다." });
    }
    const delPost = await Posts.findByIdAndDelete(postId); // findByIdAndDelete() 메서드를 써서 게시물을 삭제한다.
    res.status(200).json({ data: "게시글을 삭제하였습니다." }); // 완료시 보여주는 메세지
  } catch (err) {
    res.status(400).json({ error: "게시글이 정상적으로 삭제되지 않았습니다." }); // 오류시 보여주는 메세지
  }
});

module.exports = router; // router객체를 모듈로 내보낸다
