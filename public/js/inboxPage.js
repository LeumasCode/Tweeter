$(document).ready(()=>{
    $.get('/api/chats', (data)=>{
outputChatList(data, $('.resultsContainer'))
    })
})

function outputChatList(chatList, container){
    console.log(chatList)
}