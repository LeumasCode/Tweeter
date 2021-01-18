$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    outputNotificationList(data, $(".resultsContainer"));
  });
});

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

  let text = getNotificationText(notification)

  return `<a href='#' class='resultListItem notification'>
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
