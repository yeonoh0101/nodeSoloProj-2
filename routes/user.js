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

// 회원가입 API
router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  // password, confirmpassword 값 확인
  if (password !== confirmPassword) {
    res.status(412).json({
      error: "비밀번호와 비밀번호 확인값이 일치하지 않습니다.",
    });
    return;
  }
  // 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성 확인
  if (!nickname.match(/^[a-zA-Z0-9]{3,50}$/)) {
    res.status(412).json({
      error: "닉네임은 영어와 숫자만 포함한 3자리 이상의 문자로 입력해주세요.",
    });
    return;
  }

  // 닉네임과 비밀번호가 같은 경우 회원가입 실패
  if (nickname === password) {
    res.status(412).json({
      error: "닉네임과 비밀번호는 같을 수 없습니다.",
    });
    return;
  }

  // 비밀번호가 4글자 이하인 경우
  if (password.length < 4) {
    res.status(412).json({ error: "비밀번호는 4자리 이상 입력해주세요." });
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
