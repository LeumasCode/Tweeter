let timer;

$("#searchBox").keydown((e) => {
  clearTimeout(timer);

  let textBox = $(e.target);

  let value = textBox.val();

  let searchType = textBox.data().search;

  timer = setTimeout(() => {
      value = textBox.val().trim()

      if(value==''){
          $('.resultContainer').html('')
      }else{
          console.log(value)
      }
  }, 1000);
});
