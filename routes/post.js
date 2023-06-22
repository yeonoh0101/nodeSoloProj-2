const express = require("express"); // express module을 express 변수에 할당
const router = express.Router(); // express.Router로 호출한다
const authMiddleware = require("../middlewares/auth-middleware.js");
const Posts = require("../schemas/post.js"); // "../schemas/post.js"를 불러온다

// 전체 게시글 조회 API
router.get("/posts", async (req, res) => {
  // "/posts" 경로에 대한 GET 요청을 보낸다
  try {
    const posts = await Posts.find() // Posts에서 모든 게시글을 조회한다
      .select("-password -content -__v") // password, content, __v 필드를 제외하고 조회한다.
      .sort({ createdAt: -1 }); // createdAt 필드를 기준으로 내림차순으 정렬한다(최신순)
    res.json({ data: posts }); // 조회된 게시글을 JSON 형식으로 응답한다
  } catch (error) {
    res.status(404).json({ error: "게시글 조회에 실패했습니다." }); // 오류가 발생한다면 json형식으로 error메세지를 보여준다.
  }
});

// 게시글 추가 API
router.post("/posts", authMiddleware, async (req, res) => {
  // "/posts" 경로에 대한 POST 요청을 보낸다.
  const { user, password, title, content } = req.body;
  const { nickname } = res.locals.user;

  const existingPosts = await Posts.find({ user }); // user로 이미 존재하는 게시물을 조회
  if (existingPosts.length) {
    // 중복되는 게시글이 존재한다면
    return res.status(400).json({
      success: false,
      errorMessage: "중복되는 게시물이 존재합니다.",
    }); // HTTP 상태 코드를 400으로 알리고 json형태로 errorMessage를 받는다.
  }

  const createdPosts = await Posts.create({
    // Posts.create() 메소드를 사용하여 새로운 게시글을 생성한다.생성하는 게시글 내용을 createdPosts 변수에 할당한다.
    user,
    password,
    title,
    content,
    createdAt: new Date(), // new Date()를 사용하여 현재의 날짜와 시간으로 설정한다.
  });

  res.json({ posts: "게시물을 생성하였습니다." });
});

// 게시글 상세 조회 API
router.get("/posts/:_id", async (req, res) => {
  // "/posts/:_id" 경로에 대한 GET 요청을 보낸다.
  const { _id } = req.params;
  try {
    const posts = await Posts.findById(_id) // _id에 해당하는 게시물을 조회한다
      .select("-password -content -__v") // password, content, __v 필드를 제외하고 조회한다
      .sort({ createdAt: -1 }); // createdAt 필드를 기준으로 내림차순 정렬한다.
    if (!posts) {
      // 게시글이 없는경우
      return res
        .status(404)
        .json({ error: "해당하는 게시물을 찾을 수 없습니다." });
    } // HTTP 상태 코드를 404로 알리고 json형태로 errorMessage를 받는다.
    res.json({ data: posts }); // 조회된 게시물을 JSON 형식으로 보여준다
  } catch (error) {
    res.status(500).json({ error: "게시글 조회에 실패했습니다." });
  } // 오류가 발생한다면 json형식으로 error메세지를 보여준다.
});

// 게시글 수정 API
router.put("/posts/:_id", async (req, res) => {
  // "/posts/:_id" 경로에 대한 PUT 요청을 보낸다.
  const { _id } = req.params;
  const { password, title, content } = req.body;

  try {
    const posts = await Posts.findOne({ _id, password }); // _id와 password에 해당하는 게시물을 조회한다
    if (!posts) {
      // 게시글이 없다면
      return res
        .status(404)
        .json({ error: "해당하는 게시물을 찾을 수 없습니다." }); // 게시물이 없거나 비밀번호가 일치하지 않는 경우 오류 응답을 한다
    }
    await Posts.updateOne({ _id, password }, { $set: { title, content } }); // 게시물 수정한 것 업데이트
    res.json({ data: "게시물 수정에 성공했습니다." });
  } catch (err) {
    res.status(500).json({ error: "게시물 수정에 실패했습니다." }); // 오류가 발생한 경우 오류메세지를 보여준다.
  }
});

// 게시글 삭제 API
router.delete("/posts/:_id", async (req, res) => {
  const { _id } = req.params;
  const { password } = req.body;

  try {
    const posts = await Posts.findById(_id); // _id에 해당하는 게시물을 조회
    if (!posts) {
      return res
        .status(404)
        .json({ error: "해당하는 게시물을 찾을 수 없습니다." }); // 게시물이 없는 경우 오류메세지를 보여준다.
    }
    if (posts.password !== password) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." }); // 비밀번호가 일치하지 않는 경우 오류메세지를 보여준다.
    }
    const delPost = await Posts.findByIdAndDelete(_id); // findByIdAndDelete() 메서드를 써서 게시물을 삭제한다.
    res.json({ data: "게시물 삭제 완료했습니다." }); // 완료시 보여주는 메세지
  } catch (err) {
    res.status(500).json({ error: "게시물 삭제에 실패했습니다." }); // 오류시 보여주는 메세지
  }
});

module.exports = router; // router객체를 모듈로 내보낸다
