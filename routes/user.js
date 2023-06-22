const express = require("express");
const router = express.Router();
const userSchema = require("../schemas/user.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 내 정보 조회 API
router.get("/signup/me", authMiddleware, async (req, res) => {
  const { nickname } = res.locals.user;

  res.status(200).json({
    user: {
      nickname: nickname,
    },
  });
});

// 회원가입
router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  // password, confirmpassword 값 확인
  if (password !== confirmPassword) {
    res.status(400).json({
      error: "비밀번호와 비밀번호 확인값이 일치하지 않습니다.",
    });
    return;
  }
  // nickname이 실제로 DB에 존재하는지 확인
  const isExisUser = await userSchema.findOne({
    $or: [{ nickname }], // nickname이 일치할때 조회한다.
  });
  if (isExisUser) {
    res.status(400).json({
      errorMessage: "닉네임이 이미 사용중입니다.",
    });
    return;
  }

  const user = new userSchema({ nickname, password });
  await user.save(); // DB에 저장한다.

  return res.status(201).json({});
});

module.exports = router;
