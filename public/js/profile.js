function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId }, (results) => {
    outputPosts(results, $(".postsContainer"));
    console.log(profileUserId);
  });
}

$(document).ready(() => {
  loadPosts();
});
