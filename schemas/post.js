const mongoose = require("mongoose"); // mongoose 모듈을 가져와서 mongoose라는 변수에 할당한다.

// mongoose.Schema를 사용하여 스키마를 생성한다.
const postsSchema = new mongoose.Schema({
  // user 필드
  user: {
    type: String, // String type 지정
    required: true, // 꼭 있어야되는 값
    unique: true, // 값을 독립적으로 지정(중복된 값 X)
  },

  // password 필드
  password: {
    type: Number, // Number type 지정
    required: true, // 꼭 있어야되는 값
  },

  // title 필드
  title: {
    type: String, // String type 지정
    required: true, // 꼭 있어야되는 값
  },

  // content 필드
  content: {
    type: String, // String type 지정
    required: true, // 꼭 있어야되는 값
  },

  // createdAt 필드
  createdAt: {
    type: Date, // Date type 지정
    required: true, // 꼭 있어야되는 값
  },
});

module.exports = mongoose.model("Posts", postsSchema);
// mongoose.model을 사용하여 "Posts" 모델을 생성하고 내보낸다.컬렉션 명을 Posts로 한다. postsSchema는 실제로 데이터가 생성 될 schemas에 대한 값이다.
