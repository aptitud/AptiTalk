//Init
$(function () {
  theUser = {
    id: $('#userId').text(),
    name: $('#userName').text(),
    email: $('#userEmail').text()
  };
  $('time').timeago();
});