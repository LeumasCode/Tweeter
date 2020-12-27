$("#postTextarea").keyup((event) => {
  const textBox = $(event.target);
  const value = textBox.val().trim();

  const submitButton = $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
});

$("#submitPostButton").click(() => {
  const button = $(event.target);
  const textBox = $("#postTextarea");

  const data = {
    content: textBox.val(),
  };

  $.post("/api/posts", data, (postData) => {
    const html = createPostHtml(postData);
    $(".postsContainer").prepend(html);

    textBox.val("");

    button.prop("disabled", true);
  });
});

function createPostHtml(postData) {
  const { postedBy, content } = postData;

  if (postedBy._id === undefined) {
    return console.log("user object not populated");
  }

  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = postData.createdAt;

  return `<div class='post'>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postedBy.image}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header'>
                        <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                        <span class='username'>@${postedBy.username}</span>
                        <span class='date'>${timestamp}</span>
                    </div>
                    <div class='postBody'>
                    <span>${content}</span>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button>
                                <i class='far fa-comment'></i>
                            </button>
                        </div>

                          <div class='postButtonContainer'>
                            <button>
                                <i class='fas fa-retweet'></i>
                            </button>
                        </div>

                          <div class='postButtonContainer'>
                            <button>
                                <i class='far fa-heart'></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    
    
    </div>`;
}
