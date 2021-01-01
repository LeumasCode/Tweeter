function loadFollowers() {
  $.get(`/api/profile/users/${profileUserId}/followers`, (results) => {
    outputUsers(results.followers, $(".resultsContainer"));
  });
}

function loadFollowing() {
  $.get(
    `/api/profile/users/${profileUserId}/following`,

    (results) => {
      outputUsers(results.following, $(".resultsContainer"));
    }
  );
}

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
  let name = userData.firstName + "" + userData.lastName;
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
            </div>`;
}

$(document).ready(() => {
  if (selectedTab === "followers") {
    loadFollowers();
  } else {
    loadFollowing();
  }
});
