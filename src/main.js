//koa프레임워크가 해당 라이브러리를 찾을 수 있도록 선언함.
//왜냐면 일을 시켜야 하니까
const Koa = require('koa') //1
//const app = new Koa();//2
const path = require('path')//3
const serve = require('koa-static')//6 - 정적리소스 경로 설정하기
//15번처럼 js파일에 html태그를 작성하는 것은 너무 비효율적이다.
//그래서 우리는 XXX.html문서 단위로 렌더링 처리를 요청할 수 있는
//send라는 함수를 koa-send라이브러리로 부터 제공받는다.
const send = require('koa-send')//7 - html파일을 통째로 렌더링 요청가능
const mount = require('koa-mount') //8 - views와 public 구분
const websockify = require('koa-websocket')//9 - 웹소켓
const app = websockify(new Koa())//10 - 머지
const route = require('koa-route')//11 - 요청을 구분 해서 처리

const { initializeApp } = require("firebase/app"); //로컬에서 참조함.
const { getFirestore } = require("firebase/firestore"); //로컬에서 참조함.

const firebaseConfig = {
  apiKey: "AIzaSyBnbbKq3Sutrv-wp8yc46D9KSKHtB6KQ9s",
  authDomain: "bookapp7213.firebaseapp.com",
  databaseURL: "https://bookapp7213-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bookapp7213",
  storageBucket: "bookapp7213.firebasestorage.app",
  messagingSenderId: "453880308052",
  appId: "1:453880308052:web:501407a90fa77135ede8c1"
};
//firebase 앱 초기화
const talkApp = initializeApp(firebaseConfig);
const db = getFirestore(talkApp);
//정적 리소스에 대한 파일 경로 설정하기
const staticPath = path.join(__dirname, './views')//4

app.use(serve(staticPath));//5

//9 - public의 경로와 views의 경로에 같은 파일이 있으면 구별이 안된다.
app.use(mount('/public', serve('src/public'))) //처리-이벤트- 말하기
//서버는 5000번 포트를 열어놓고 기다린다. -waiting

//기본 라우터 설정하기
app.use(async(ctx) => {
  if(ctx.path === '/'){
    ctx.type = 'text/html'
    //index.html문서가 하는 일을 여기에 작성해 본다.
    ctx.body = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>welcome</title>
      </head>
      <body>
        <h1>Welcome to the koa server</h1>
      </body>
      </html>    
    `
  }
  //http://localhost:5000/talk
  else if(ctx.path === '/login'){
    await send(ctx, 'login.html', {root:staticPath})
  }
  else if(ctx.path === '/talk'){
    await send(ctx, 'talk.html', {root:staticPath})
  }
  else if(ctx.path === '/notice'){
    await send(ctx, 'notice.html', {root:staticPath})
  }
  else{
    ctx.status = 404
    ctx.body = 'Page Not Found'
  }
});//end of use

// npm i koa-route 먼저 설치한다.
// 왜나면 koa-websocket과 koa-route 서로 의존관계 있다.
// Using routes
app.ws.use(
  //ws는 websocket을 의미한다.
  //-> /test/:id로 요청이 오면 아래를 처리하라.
  route.all('/ws', async(ctx) => {
    const interval = setInterval(() => {
      if(ctx.websocket.readyState === ctx.websocket.OPEN) {
        //클라이언트가 연결되어 있으면
        ctx.websocket.send(JSON.stringify({ 
          message: 'ping' })); //ping 메시지를 보낸다.
      }
    },30000)

  ctx.websocket.on('message', (data) => {
    //클라이언트가 보낸 메시지를 출력한다.
    console.log(typeof data);
    if(typeof JSON.stringify(data) !== 'string') {
      return; //함수에서 return을 만나면 함수가 종료된다. //string이면 아래로
    }

    const { nickname, message } = JSON.parse(data);
    console.log(`${nickname} , ${message}`); //서버측 출력


    const { server } = app.ws;
    if(!server) { 
      return;//return을 만나면 use함수 전체를 빠져나감
    }

    server.clients.forEach((client) => {
      //서버측에 연결된 모든 클라이언트에게 메시지를 전송한다.
      if(client.readyState === client.OPEN) {
        client.send(JSON.stringify({ 
          nickname: nickname,
          message: message })); 
      }
    });
  });
}));

/* 
//서버측에서 클라이언트측에 전송하기
//들은것을 말하기
ctx.websocket.send(JSON.stringify({ 
  nickname: nickname,
  message: message })); 
*/

app.listen(5000);