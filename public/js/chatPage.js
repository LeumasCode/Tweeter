$(document).ready(() => {
  $.get(`http://localhost:5000/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data));
  });

  $.get(`http://localhost:5000/api/chats/${chatId}/messages`, (data) => {
    let messages = [];

    data.forEach((message) => {
      let html = createMessageHtml(message);
      messages.push(html);
    });

    let messagesHtml = messages.join("");

    addMessagesHtmlToPage(messagesHtml);
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

  // scroll to the bottom
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

  let messageDiv = createMessageHtml(message);

  addMessagesHtmlToPage(messageDiv);
}

function createMessageHtml(message) {
  let isMine = message.sender._id == userLoggedIn._id;
  let liClassMine = isMine ? "mine" : "theirs";

  return `<li class='message ${liClassMine}'>
            <div class="messageContainer">
                <span class="messageBody">${message.content}</span>
            </div>
          </li>`;
}
