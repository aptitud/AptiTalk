$(document).keypress(function (event) {
	console.log(event.keyCode);
	if (event.keyCode === 13) {
		$('.btn-primary').click();
	}
});

$('.btn-primary').click(function (event) {
	this.click();
});