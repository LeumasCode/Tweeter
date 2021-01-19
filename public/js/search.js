

$("#searchBox").keydown((e) => {
  clearTimeout(timer);

  let textBox = $(e.target);

  let value = textBox.val();

  let searchType = textBox.data().search;

  timer = setTimeout(() => {
    value = textBox.val().trim();

    if (value == "") {
      $(".resultContainer").html("");
    } else {
      search(value, searchType);
    }
  }, 1000);
});

function search(searchTerm, searchType) {
  let url = searchType == "users" ? "/api/users" : "/api/posts";

  $.get(url, { search: searchTerm }, (results) => {
    if (searchType == "users") {
      outputUsers(results, $(".resultsContainer"));
    } else {
      outputPosts(results, $(".resultsContainer"));
    }
  });
}
