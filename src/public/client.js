//alert('client.js loaded....')
//브라우저 개발 도구에서 socket객체를 직접 호출하면 외부에 노출 위험이 있다.
//즉시 실행 함수로 처리함. - IIFE - 바로 정의해서 호출하는 함수
;(()=>{
  const socket = new WebSocket(`ws://${window.location.host}/ws`)
  const formEl = document.querySelector('#form')
  const inputEl = document.querySelector('#input')
  
  if(!formEl || !inputEl){ // | 나 || 결과는 같다 차이는 첫조건이 false일때 |는 뒤에도 확인하고 ||는 뒤에는 확인 안한다.
    throw new Error('formEl or inputEl is null')
  }
  formEl.addEventListener('submit',(e)=>{
    e.preventDefault()
    socket.send(inputEl.value) //서버측 출력
    inputEl.value = '' //입력창 비우기(후처리)
  })
  //서버에서 보낸 정보를 받아서 출력하기
  socket.addEventListener('message', (event)=>{
    //서버에서 보낸 메시지 청취하기
    alert(event.data) //Hello, Client 출력
  })
})()