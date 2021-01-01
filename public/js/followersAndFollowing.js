function loadFollowers() {
  $.get(
    `/api/profile/users/${profileUserId}/followers`,
    (results) => {
      outputUsers(results, $(".postsContainer"));
    }
  );
}

function loadFollowing() {
  $.get(
    `/api/profile/users/${profileUserId}/following`,

    (results) => {
      outputUsers(results, $(".resultsContainer"));
    }
  );
}

function outputUsers(data, container) {
    console.log(data)
}

$(document).ready(() => {
  if (selectedTab === "followers") {
    loadFollowers();
  } else {
    loadFollowing();
  }
});
