//alert('client.js loaded....')
//브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
//즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  let myNickname = prompt('닉네임을 입력하세요','default')
  const title = document.querySelector('#title')
  if(myNickname != null){
    title.innerHTML = `{{${myNickname}}}님의 예약 상담`
  }
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  const chatsEl = document.querySelector('#chats')
  function updateClock() {
      const now = new Date();
      const timeString = now.toLocaleTimeString(); // HH:MM:SS
  }
  
  
  
  
  if(!formEl || !inputEl || !chatsEl){ // | 나 || 결과는 같다 차이는 첫조건이 false일때 |는 뒤에도 확인하고 ||는 뒤에는 확인 안한다.
    throw new Error('formEl or inputEl or chatsEl is null')
  }
  const chats = []
  formEl.addEventListener('submit',(e)=>{
    e.preventDefault()
    //데이터를 직렬화 하는 방법은 여러가지가 있는데 가장 쉬운 방법이 JSON.stringify()를 사용하는 것이다.
    //아래 send 함수는 string이나 버퍼류, Blob,등만 전달할 수 있다.
    //그래서 문자열로 변환해서 전달해야 한다. JSON.stringify() , JSON.parse()
    //데이터를 object로 직접 보낼 수가 없다.
    //데이터를 소켓통신으로 전송하기 전에 JSON.stringify()로 감싸주는것 이것도 전처리 이다.
    socket.send(JSON.stringify({ 
      nickname: myNickname,
      message: inputEl.value})) //서버측 출력
      inputEl.value = '' //입력창 비우기(후처리)
    })
    //서버에서 보낸 정보를 받아서 출력하기
    socket.addEventListener('message', (event)=> {
    const { nickname, message } = JSON.parse(event.data);
    
    // 메시지를 받은 시점의 시간 저장
    let now = new Date();
    let time = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  
    // chats 에 시간도 함께 저장
    chats.push({ nickname, message, time });
  
    // 전체 채팅 다시 그리기
    chatsEl.innerHTML = '';
    chats.forEach(({ nickname, message, time }) => {
      const div = document.createElement('div');
      div.innerText = `${nickname}: ${message} [${time}]`;
      chatsEl.appendChild(div);
    });
  });
    
  })()
