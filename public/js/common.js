$("#postTextarea, #replyTextarea").keyup((event) => {
  const textBox = $(event.target);
  const value = textBox.val().trim();

  let isModal = textBox.parents(".modal").length == 1;

  const submitButton = isModal
    ? $("#submitReplyButton")
    : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No submit button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);
});

$("#submitPostButton, #submitReplyButton").click(() => {
  const button = $(event.target);
  let isModal = button.parents(".modal").length == 1;

  const textBox = isModal ? $("#replyTextarea") : $("#postTextarea");

  let data = {
    content: textBox.val(),
  };

  if (isModal) {
    let id = button.data().id;
    data.replyTo = id;
  }

  $.post("/api/posts", data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $(".postsContainer").prepend(html);

      textBox.val("");

      button.prop("disabled", true);
    }
  });
});

$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#submitReplyButton").data("id", postId);

  $(document).ready(() => {
    $.get(`/api/posts/${postId}`, (results) => {
      outputPosts(results.postData, $("#originalPostContainer"));
    });
  });
});

$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").html("");
});

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);

});

$("#deletePostButton").click((event)=>{
  let postId = $(event.target).data('id')

  $.ajax({
    url: `api/posts/${postId}`,
    type: "DELETE",
    success: (postData) => {
     location.reload()
    },
  });
});

$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);

  const postId = getPostIdFromElement(button);
  if (postId === undefined) return;

  $.ajax({
    url: `api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".retweetButton", (event) => {
  const button = $(event.target);

  const postId = getPostIdFromElement(button);
  if (postId === undefined) return;

  $.ajax({
    url: `api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "");

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  let element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is("button")) {
    window.location.href = `/posts/${postId}`;
  }
});

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");

  const postId = rootElement.data().id;

  if (postId === undefined) return alert("Post id is undefined");

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null) alert("post object is null");

  let isRetweet = postData.retweetData !== undefined;

  let retweetedBy = isRetweet ? postData.postedBy.username : null;

  postData = isRetweet ? postData.retweetData : postData;

  // let { postedBy } = postData;

  // console.log(postedBy);

  // if (postedBy._id === undefined) {
  //   return console.log("user object not populated");
  // }

  const displayName =
    postData.postedBy.firstName + " " + postData.postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  const retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";

  let largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = "";

  if (isRetweet) {
    retweetText = `<span>
                      <i class='fas fa-retweet'></i>
                      Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                    </span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert("replyTo is not pupulated");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("posted By is not pupulated");
    }

    console.log(postData);
    let replyToUsername = postData.replyTo.postedBy.username;

    replyFlag = `<div class='replyFlag'>
                  Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>

              </div>`;
  }

  let buttons = "";

  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `<button data-id='${postData._id}' data-toggle='modal' data-target='#deletePostModal'><i class='fas fa-times'></i></button>`;
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
              ${retweetText}
            </div>
            <div class='mainContentContainer'>
                <div class='userImageContainer'>
                    <img src='${postData.postedBy.image}'>
                </div>
                <div class='postContentContainer'>
                    <div class='header '>
                        <a href='/profile/${
                          postData.postedBy.username
                        }' class='displayName'>${displayName}</a>
                        <span class='username'>@${
                          postData.postedBy.username
                        }</span>
                        <span class='date'>${timestamp}</span>
                        ${buttons}
                    </div>
                   ${replyFlag}
                    <div class='postBody'>
                    <span>${postData.content}</span>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button data-toggle='modal' data-target='#replyModal'>
                                <i class='far fa-comment'></i>
                            </button>
                        </div>

                          <div class='postButtonContainer green'>
                            <button class='retweetButton ${retweetButtonActiveClass}'>
                                <i class='fas fa-retweet'></i>
                                <span>${
                                  postData.retweetUsers.length || ""
                                }</span>
                            </button>
                        </div>

                          <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='far fa-heart'></i>
                                <span>${postData.likes.length || ""}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    
    
    </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResult'>Nothing to show</span>");
  }
}

const outputPostsWithReplies = (results, container) => {
  container.html("");

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
};
