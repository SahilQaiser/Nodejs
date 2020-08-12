const socket = io();
var messageContainer = $('#scroll-container');
var message = $("#message");
var sendMessage = $("#sendMessage");
var to = $("#to").val();
var from = $("#from").val();
var chatroom = from+":"+to;
var chatroom2 = to+":"+from;
var board = $('#board');

sendMessage.click(function(){
if(message.val() != '') {
    socket.emit(chatroom,{message: message.val(), to: to, from : from})
    message.val('');
    console.log('message sent...');
}
});
//Listen to msgs
socket.on(chatroom, (data)=>{
console.log(JSON.stringify(data));
    messageContainer.append("<div class='alert text-right alert-info'><span>" + data.message + " - <b>" + data.from + "</b></span></div>");
})

socket.on(chatroom2, (data)=>{
console.log(JSON.stringify(data));
    messageContainer.append("<div class='alert text-left alert-success'><span><b>" + data.from + "</b> - " + data.message + "</span></div>");
})

socket.on('broadcast', (data)=>{
    board.html("<div class='alert text-left alert-success'><span><b>" + data.from + "</b> - " + data.message + "</span></div>");
})