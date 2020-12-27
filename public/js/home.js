$(document).ready(() => {
  $.get("/api/posts", (result) => {
    console.log(result);
  });
});
