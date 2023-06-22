const mongoose = require("mongoose"); // mongoose module을 가져온다.

// MongoDB에 연결하는 함수
const connect = () => {
  // mongoose를 사용하여 MongoDB에 연결한다.
  mongoose
    .connect("mongodb://127.0.0.1:27017/nodeSoloProj2") // mongoose.connect를 사용하여 MongoDB에 연결한다.
    .catch((err) => console.log(err));
};

// MongoDB 연결 시 발생한 에러를 처리하는 이벤트 리스너
mongoose.connection.on("error", (err) => {
  console.error("몽고디비 연결 에러", err);
});

// connect 함수를 모듈의 기본 내보내기로 설정하여 다른 파일에서 사용할 수 있게 한다.
module.exports = connect;
