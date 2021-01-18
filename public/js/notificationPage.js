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

  return `<a href='#' class='resultListItem notification'>
            <div class='resultsImageContainer'>
                <img src='${userFrom.image}'>
                
            </div>
            <div class='resultsDetailsContainer ellipsis'>
                <span class= 'ellipsis'>This is the text</span>
            </div>
        </a>`;
}
