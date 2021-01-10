$(document).ready(() => {
  $.get("/api/chats", (data) => {
    outputChatList(data, $(".resultsContainer"));
  });
});

function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    let html = createChatHtml(chat);
    container.append(html);
  });

  if (chatList.length == 0) {
    container.append("<span class='noResults'>Nothing to show</span>");
  }
}

function createChatHtml(chatData) {
  let chatName = getChatName(chatData);
  let image = getChatImageElements(chatData);
  let latestMessage = "this is latest message";

  return `<a href='/messages/${chatData._id}' class='resultListItem'>
            ${image}
            <div class='resultsDetailsContainer'>
                <span class='heading'>${chatName}</span>
                <span class='subText'>${latestMessage}</span>
            </div>

        </a>`;
}

function getChatName(chatData) {
  let chatName = chatData.chatName;
  if (!chatName) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let namesArray = otherChatUsers.map(
      (user) => user.firstName + " " + user.lastName
    );
    chatName = namesArray.join(",");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length == 1) return users;

  return users.filter((user) => user._id != userLoggedIn._id);
}

function getChatImageElements(chatData) {
  let otherChatUsers = getOtherChatUsers(chatData.users);

  let groupChatClass = "";

  let chatImage = getUserChatImageElement(otherChatUsers[0]);

  if (otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }
  return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  console.log(user);
  if (!user || !user.image) {
    return alert("User passed into function is invalid");
  }
  return `<image src='${user.image}' alt='Users profile pic'></image>`;
}
