// globals
let cropper;
let timer;
let selectedUsers = [];

$(document).ready(() => {
  refreshMessagesBadge();

  refreshNotificationsBadge();
});

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
      emitNotification(postData.replyTo.postedBy);
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

$("#confirmPinModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#pinPostButton").data("id", postId);
});

$("#unpinModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#unpinPostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
  let postId = $(event.target).data("id");

  $.ajax({
    url: `api/posts/${postId}`,
    type: "DELETE",
    success: (postData) => {
      location.reload();
    },
  });
});

$("#pinPostButton").click((event) => {
  let postId = $(event.target).data("id");

  $.ajax({
    url: `api/posts/${postId}`,
    type: "PUT",
    data: { pinned: true },
    success: (postData) => {
      location.reload();
    },
  });
});

$("#unpinPostButton").click((event) => {
  let postId = $(event.target).data("id");

  $.ajax({
    url: `api/posts/${postId}`,
    type: "PUT",
    data: { pinned: false },
    success: (postData) => {
      location.reload();
    },
  });
});

$("#filePhoto").change(function () {
  if (this.files && this.files[0]) {
    let reader = new FileReader();

    reader.onload = (e) => {
      let image = document.getElementById("imagePreview");

      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };

    reader.readAsDataURL(this.files[0]);
  }
});

$("#coverPhoto").change(function () {
  if (this.files && this.files[0]) {
    let reader = new FileReader();

    reader.onload = (e) => {
      let image = document.getElementById("coverPreview");

      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };

    reader.readAsDataURL(this.files[0]);
  }
});

$("#userSearchTextbox").keydown((e) => {
  clearTimeout(timer);

  let textBox = $(e.target);

  let value = textBox.val();

  if (value == "" && (e.which == 8 || e.keyCode == 8)) {
    // remove user from selection
    selectedUsers.pop();
    updateSelectedUsersHtml();
    $(".resultsContainer").html("");
    if (selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true);
    }
    return;
  }

  timer = setTimeout(() => {
    value = textBox.val().trim();

    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      searchUsers(value);
    }
  }, 1000);
});

$("#createChatButton").click(() => {
  const data = JSON.stringify(selectedUsers);

  $.post("/api/chats", { users: data }, (chat) => {
    window.location.href = `/messages/${chat._id}`;
  });
});

$("#imageUploadButton").click(() => {
  let canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    alert("could not load image, try again");
    return;
  }

  canvas.toBlob((blob) => {
    let formData = new FormData();

    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      processData: false,
      contentType: false,
      data: formData,
      success: () => {
        location.reload();
      },
    });
  });
});

$("#coverPhotoUploadButton").click(() => {
  let canvas = cropper.getCroppedCanvas();

  if (canvas == null) {
    alert("could not load image, try again");
    return;
  }

  canvas.toBlob((blob) => {
    let formData = new FormData();

    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      processData: false,
      contentType: false,
      data: formData,
      success: () => {
        location.reload();
      },
    });
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
        emitNotification(postData.postedBy);
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
        emitNotification(postData.postedBy);
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

$(document).on("click", ".followButton", (event) => {
  let button = $(event.target);
  let userId = button.data().user;

  $.ajax({
    url: `http://localhost:5000/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status == 404) {
        return alert("User not found");
      }
      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");

        emitNotification(userId);
      } else {
        button.removeClass("following");

        location.reload();
        difference = -1;
      }

      let followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        let followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

$(document).on("click", ".notification.active", (e) => {
  let container = $(e.target);

  let notificationId = container.data().id;

  let href = container.attr("href");

  e.preventDefault();

  let callback = () => (window.location = href);

  console.log(notificationId);

  markNotificationsAsOpened(notificationId, callback);
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

    let replyToUsername = postData.replyTo.postedBy.username;

    replyFlag = `<div class='replyFlag'>
                  Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>

              </div>`;
  }

  let buttons = "";
  let pinnedPostText = "";

  if (postData.postedBy._id == userLoggedIn._id) {
    let pinnedClass = "";
    let dataTarget = "#confirmPinModal";

    if (postData.pinned == true) {
      pinnedClass = "active";
      dataTarget = "#unpinModal";
      pinnedPostText =
        "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
    }
    buttons = ` <button class= 'pinButton ${pinnedClass}' data-id='${postData._id}' data-toggle='modal' data-target='${dataTarget}'><i class='fas fa-thumbtack'></i></button>
                <button data-id='${postData._id}' data-toggle='modal' data-target='#deletePostModal'><i class='fas fa-times'></i></button>`;
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
                    <div class= 'pinnedPostText'>${pinnedPostText}</div>
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

function outputUsers(results, container) {
  container.html("");

  results.forEach((result) => {
    let html = createUserHtml(result, true);
    container.append(html);
  });
  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function createUserHtml(userData, showFollowButton) {
  let name = userData.firstName + " " + userData.lastName;

  let isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);

  let text = isFollowing ? "Following" : "Follow";
  let buttonClass = isFollowing ? "followButton following" : "followButton";

  let followButton = "";
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                        <button class= '${buttonClass}' data-user= '${userData._id}'>${text}</button>
                    </div>`;
  }
  return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.image}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}

function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
}

function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach((result) => {
    if (
      result._id == userLoggedIn._id ||
      selectedUsers.find((u) => u._id == result._id)
    ) {
      return;
    }
    let html = createUserHtml(result, false);
    let element = $(html);
    element.click(() => userSelected(result));

    container.append(element);
  });
  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();

  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");

  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
  let elements = [];

  selectedUsers.forEach((user) => {
    let name = user.firstName + " " + user.lastName;

    let userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();

  $("#selectedUsers").prepend(elements);
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

function messageReceived(newMessage) {
  if ($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
    // show pop up notification
    showMessagePopup(newMessage);
  } else {
    addChatMessageHtml(newMessage);
  }

  refreshMessagesBadge();
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
  if (callback == null) callback = () => location.reload();
  console.log(notificationId);

  let url =
    notificationId != null
      ? `http://localhost:5000/api/notifications/${notificationId}/markAsOpened`
      : `http://localhost:5000/api/notifications/markAsOpened`;

  $.ajax({
    url,
    type: "PUT",
    success: () => callback(),
  });
}

function refreshMessagesBadge() {
  $.get("http://localhost:5000/api/chats", { unreadOnly: true }, (data) => {
    let numResults = data.length;

    console.log(numResults);

    if (numResults > 0) {
      $("#messagesBadge").text(numResults).addClass("active");
    } else {
      $("#messagesBadge").text("").removeClass("active");
    }
  });
}

function refreshNotificationsBadge() {
  $.get(
    "http://localhost:5000/api/notifications",
    { unreadOnly: true },
    (data) => {
      let numResults = data.length;

      console.log(numResults);

      if (numResults > 0) {
        $("#notificationsBadge").text(numResults).addClass("active");
      } else {
        $("#notificationsBadge").text("").removeClass("active");
      }
    }
  );
}

function showNotificationPopup(data) {
  let html = createNotificationHtml(data);

  let element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => {
    element.fadeOut(400);
  }, 5000);
}

function showMessagePopup(data) {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }

  let html = createChatHtml(data.chat);

  let element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast");

  setTimeout(() => {
    element.fadeOut(400);
  }, 5000);
}

function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    let html = createNotificationHtml(notification);

    container.append(html);
  });

  if (notifications.length == 0) {
    container.append('<span class="noResults">Nothing to show</span>');
  }
}

function createNotificationHtml(notification) {
  let userFrom = notification.userFrom;

  let text = getNotificationText(notification);

  let href = getNotificationUrl(notification);

  let className = notification.opened ? "" : "active";

  console.log(notification._id);

  return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
            <div class='resultsImageContainer'>
                <img src='${userFrom.image}'>
                
            </div>
            <div class='resultsDetailsContainer ellipsis'>
                <span class= 'ellipsis'>${text}</span>
            </div>
        </a>`;
}

function getNotificationText(notification) {
  let userFrom = notification.userFrom;

  if (!userFrom.firstName || !userFrom.lastName) {
    alert("userFrom not populated");
  }

  let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

  let text;

  if (notification.notificationType == "retweet") {
    text = `${userFromName} retweeted your post`;
  } else if (notification.notificationType == "like") {
    text = `${userFromName} liked your post`;
  } else if (notification.notificationType == "reply") {
    text = `${userFromName} replied to your post`;
  } else if (notification.notificationType == "follow") {
    text = `${userFromName} followed you`;
  }

  return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) {
  let url = "#";

  if (
    notification.notificationType == "retweet" ||
    notification.notificationType == "like" ||
    notification.notificationType == "reply"
  ) {
    url = `/posts/${notification.entityId}`;
  } else if (notification.notificationType == "follow") {
    url = `/profile/${notification.entityId}`;
  }

  return url;
}

function createChatHtml(chatData) {
  let chatName = getChatName(chatData);
  let image = getChatImageElements(chatData);
  let latestMessage = getLatestMessage(chatData.latestMessage);

  let activeClass =
    !chatData.latestMessage ||
    chatData.latestMessage.readBy.includes(userLoggedIn._id)
      ? ""
      : "active";

  return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
            ${image}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis'>${chatName}</span>
                <span class='subText ellipsis'>${latestMessage}</span>
            </div>

        </a>`;
}

function getLatestMessage(latestMessage) {
  if (latestMessage != null) {
    let sender = latestMessage.sender;

    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }

  return "New Chat";
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
