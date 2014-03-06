var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Getting posts", function () {
	after(function (done) {
		testHelpers.deleteAll();
		done();
	});

	describe("by id", function () {

		beforeEach(function (done) {
			testHelpers.deleteAll();
			done();
		});

		it("gets a post by id", function (done) {
			dbAccess.addPost(testHelpers.USERNAME, testHelpers.MESSAGE, testHelpers.fakeXssIt, testHelpers.getHashTagsFromMessage, function (result) {
				var id = result.data._id;

				var postFromDb = dbAccess.getPostById(id, function (result) {
					testHelpers.validateOkResult(result);
					result.data.username.should.equal(testHelpers.USERNAME);
					result.data.message.should.equal(testHelpers.MESSAGE);
					done();
				});
			});
		});
		it("returns an error for nonexisting id", function (done) {
			dbAccess.getPostById(123, function (result) {
				testHelpers.validateErrorResult(result, "Post '123' not found");
				done();
			});
		});
	});

	describe("by other properties", function () {
		beforeEach(function (done) {
			testHelpers.deleteAll();
			done();
		});

		it("gets all posts in pages", function (done) {
			testHelpers.addTestPosts(12, function (result) {
				dbAccess.getAllPosts(1, function (result) {
					testHelpers.validateOkResult(result);
					result.data.length.should.equal(10);
				});
			});
			done();
		});
	});
});