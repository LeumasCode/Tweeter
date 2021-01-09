$(document).ready(()=>{
    $.get('/api/chats', (data)=>{
outputChatList(data, $('.resultsContainer'))
    })
})

function outputChatList(chatList, container){
    chatList.forEach((chat)=> {
        let html = createChatHtml(chat)
        container.append(html)
    })

    if(chatList.length == 0) {
        container.append("<span class='noResults'>Nothing to show</span>")
    }
}

function createChatHtml(chatData){
let chatName = 'Chat Name' // to do later
let image = ''; // to do later
let latestMessage = 'this is latest message'

return `<a href='/messages/${chatData._id}' class='resultListItem'>
            <div class='resultDetailsContainer'>
                <span class='heading'>${chatName}</span>
                <span class='heading'>${latestMessage}</span>
            </div>

        </a>`;
}