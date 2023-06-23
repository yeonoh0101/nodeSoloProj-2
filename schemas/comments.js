const mongoose = require("mongoose"); // mongoose 모듈을 가져와서 mongoose라는 변수에 할당한다.

// mongoose.Schema를 사용하여 스키마를 생성한다.
const commentsSchema = new mongoose.Schema({
  // userId 필드
  userId: {
    type: String, // Number type 지정
    required: true, // 꼭 있어야되는 값
  },

  // postId 필드
  postId: {
    type: String, // Number type 지정
    required: true, // 꼭 있어야되는 값
  },

  // nickname 필드
  nickname: {
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

module.exports = mongoose.model("Comments", commentsSchema);
// mongoose.model을 사용하여 "Comments" 모델을 생성하고 내보낸다.컬렉션 명을 Comments로 한다. commentsSchema는 실제로 데이터가 생성 될 schemas에 대한 값이다.
