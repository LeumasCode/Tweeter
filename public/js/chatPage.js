$(document).ready(() => {
socket.emit('join room', chatId)


  $.get(`http://localhost:5000/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data));
  });

  $.get(`http://localhost:5000/api/chats/${chatId}/messages`, (data) => {
    let messages = [];

    let lastSenderId = "";

    data.forEach((message, index) => {
      let html = createMessageHtml(message, data[index + 1], lastSenderId);
      messages.push(html);

      lastSenderId = message.sender._id;
    });

    let messagesHtml = messages.join("");

    addMessagesHtmlToPage(messagesHtml);

    scrollToBottom(false);

    $(".loadingSpinnerContainer").remove();

    $(".chatContainer").css("visibility", 'visible');
  });
});

$("#chatNameButton").click(() => {
  let name = $("#chatNameTextbox").val().trim();

  $.ajax({
    url: `http://localhost:5000/api/chats/${chatId}`,
    type: "PUT",
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        return alert("could not update");
      } else {
        location.reload();
      }
    },
  });
});

$(".sendMessageButton").click(() => {
  messageSubmitted();
});

$(".inputTextbox").keydown((event) => {
  if (event.which === 13) {
    messageSubmitted();
    return false;
  }
});

function addMessagesHtmlToPage(html) {
  $(".chatMessages").append(html);
}

function messageSubmitted() {
  let content = $(".inputTextbox").val().trim();
  if (content != "") {
    sendMessage(content);
    $(".inputTextbox").val("");
  }
}

function sendMessage(content) {
  $.post(
    "http://localhost:5000/api/messages",
    { content, chatId },
    (data, status, xhr) => {
      if (xhr.status != 201) {
        alert("could not send messages");
        $(".inputTextbox").val(content);
        return;
      }

      addChatMessageHtml(data);
    }
  );
}

function addChatMessageHtml(message) {
  if (!message && !message._id) {
    alert("message is not valid");
    return;
  }

  let messageDiv = createMessageHtml(message, null, "");

  addMessagesHtmlToPage(messageDiv);

  scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  let sender = message.sender;

  let senderName = sender.firstName + " " + sender.lastName;

  let currentSenderId = sender._id;

  let nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

  let isFirst = lastSenderId != currentSenderId;

  let isLast = nextSenderId != currentSenderId;

  let isMine = message.sender._id == userLoggedIn._id;
  let liClassMine = isMine ? "mine" : "theirs";

  let nameElement = "";

  if (isFirst) {
    liClassMine += " first";

    if (!isMine) {
      nameElement = `<span class="senderName">${senderName}</span>`;
    }
  }

  let profileImage = "";

  if (isLast) {
    liClassMine += " last";

    profileImage = `<img src='${sender.image}'>`;
  }

  let imageContainer = "";

  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                        ${profileImage}
                      </div>`;
  }

  return `<li class='message ${liClassMine}'>
            ${imageContainer}
            <div class="messageContainer">
              ${nameElement}
                <span class="messageBody">${message.content}</span>
            </div>
          </li>`;
}

function scrollToBottom(animated) {
  let container = $(".chatMessages");
  let scrollHeight = container[0].scrollHeight;
  if (animated) {
    container.animate({ scrollTop: scrollHeight }, "slow");
  } else {
    container.scrollTop(scrollHeight);
  }
}
