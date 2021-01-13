$(document).ready(() => {
  $.get(`http://localhost:5000/api/chats/${chatId}`, (data) => {
    $("#chatName").text(getChatName(data));
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
