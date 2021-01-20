$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    outputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened());

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
