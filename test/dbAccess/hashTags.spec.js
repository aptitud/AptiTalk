var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Hashtags", function () {
	before(function (done) {
		testHelpers.connectMongo();
		done();
	});

	beforeEach(function (done) {
		testHelpers.deleteAll();
		done();
	});

	after(function (done) {
		testHelpers.deleteAll();
		done();
	});

	var addTestPostAndHashtag = function (tag, callback) {
		testHelpers
			.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
				var post = result.data;
				dbAccess.addHashtag(tag, post, function (result) {
					testHelpers.validateOkResult(result);
					callback(result);
					return;
			});
		});
	};

	describe("adding new", function () {
		it("adds a new hashtag and it's first post", function (done) {
			addTestPostAndHashtag("#tjäääääna", function (result) {
				testHelpers.validateOkResult(result);

				dbAccess.getHashtag("#tjäääääna", function (result) {
					testHelpers.validateOkResult(result);
					result.data.posts.length.should.equal(1);
					result.data.tag.should.equal("#tjäääääna");
					done();
				});
			});
		});
		it("adds another post to the list of post for a hashtag", function (done) {
			addTestPostAndHashtag("#tjäääääna", function (result) {
				testHelpers.validateOkResult(result);

				addTestPostAndHashtag("#tjäääääna", function (result) {
					testHelpers.validateOkResult(result);

					dbAccess.getHashtag("#tjäääääna", function (result) {
						testHelpers.validateOkResult(result);
						result.data.posts.length.should.equal(2);
						result.data.tag.should.equal("#tjäääääna");
						done();
					});
				});
			});
		});
		it("validates the precense of a tag", function (done) {
			testHelpers
				.addTestPost(testHelpers.USERNAME, testHelpers.MESSAGE, function (result) {
					var post = result.data;
					dbAccess.addHashtag("", post, function (result) {
					testHelpers.validateErrorResult(result, "Hashtag is required");
					done();
				});
			});
		});
	});
	describe("get hashtag", function () {
		it("by name", function (done) {
			addTestPostAndHashtag("#tjäääääna", function (result) {
				testHelpers.validateOkResult(result);

				dbAccess.getHashtag("#tjäääääna", function (result) {
					testHelpers.validateOkResult(result);
					result.data.posts.length.should.equal(1);
					result.data.tag.should.equal("#tjäääääna");
					done();
				});
			});
		});
		it("throws error for non-existing", function (done) {
			dbAccess.getHashtag("#tjäääääna", function (result) {
				testHelpers.validateErrorResult(result, "Hashtag '#tjäääääna' not found");
				done();
			});
		});
	});
});