const express = require("express"); // express module을 가져와 express변수에 할당한다.
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000; // port 변수에 3000을 할당한다.

const postsRouter = require("./routes/post.js"); // ./routes/post.js 파일에서 가져온 모듈을 postsRouter변수에 할당한다.
const commentsRouter = require("./routes/comments.js"); // ./routes/comments.js 파일에서 가져온 모듈을 commentsRouter변수에 할당한다.
const userRouter = require("./routes/user.js");
const authRouter = require("./routes/auth.js");
// ./schemas 파일에서 connect 함수를 가져와 호출해 MongoDB에 연결한다.
const connect = require("./schemas");
connect();

// body-parser를 써서 req.body에 들어와 있는 데이터를 정상적으로 보고 싶을 때 쓴다.
// Request 객체 안에 있는 req.body를 사용하기 위해서는 이 코드를 작성해야된다.
// body-parser Middleware를 쓰기 위한 문법이다.(app.use를 통해서 = 실제 모든 미들웨어에 적용하겠다.)
app.use(express.json()); // express.json()을 사용하여 요청 본문을 JSON 형식으로 변환해준다.
app.use(cookieParser());

app.use("/", [postsRouter, commentsRouter, userRouter, authRouter]); // "/" 경로로 요청이 들어오면 postsRouter와 commentsRouter를 차례대로 실행한다.

app.get("/", (req, res) => {
  // "/"경로로 들어오는 get요청이다.
  res.send("localhost:3000 first server"); // "localhost:3000 first server"를 응답으로 보낸다.
});

// 서버를 지정된 port로 열고, 서버가 열렸을 때 콘솔에 메시지를 출력한다.
app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸다.");
});
