const mongoose = require("mongoose"); // mongoose 모듈을 불러온다.

// mongoose.Schema를 사용하여 스키마를 생성한다.
const UserSchema = new mongoose.Schema({
  // nickname 필드
  nickname: {
    type: String, // String type 지정
    required: true, // 꼭 있어야되는 값
    unique: true, // 중복되는 값은 없게한다.
  },

  // password 필드
  password: {
    type: String, // String type 지정
    required: true, // 꼭 있어야되는 값
  },
});

// 가상의 userId 값을 할당
UserSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});

// user 정보를 JSON으로 형변환 할 때 virtual값(userId 값)이 출력되도록 설정
UserSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", UserSchema);
// mongoose.model을 사용하여 "User" 모델을 생성하고 내보낸다.컬렉션 명을 User 한다. UserSchema는 실제로 데이터가 생성 될 schemas에 대한 값이다.
