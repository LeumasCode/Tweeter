function loadPosts() {
  $.get("/api/posts", { postedBy: profileUserId, isReply:false }, (results) => {
    outputPosts(results, $(".postsContainer"));
    console.log(profileUserId);
  });
}

$(document).ready(() => {
  loadPosts();
});
