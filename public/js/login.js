$(document).keypress(function (event) {
	console.log(event.keyCode);
	if (event.keyCode === 13) {
		$('#signinButton').click();
	}
});

$('#signinButton').click(function (event) {
	this.click();
});