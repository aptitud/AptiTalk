var mongoose = require("mongoose");
var should = require("should");
var dbAccess = require("../../lib/dbAccess/dbAccess");
var testHelpers = require("./testHelpers.js");

describe("Users", function () {
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

  describe("When adding a new user", function () {
    it("adds a correct user", function (done) {
      var googleId = 'https://www.google.com/accounts/o8/id?id=xxx';
      var name = 'John Doe';
      var email = 'john.doe@unknown.com';
      dbAccess.addUser(googleId, name, email, function (result) {
        testHelpers.validateOkResult(result);
        should.exists(result.data._id);
        result.data.identifier.should.be.equal(googleId);
        result.data.name.should.be.equal(name);
        result.data.email.should.be.equal(email);
        done();
      });
    });

    it("if user already exists then it should not add a new user", function (done) {
      var googleId = 'https://www.google.com/accounts/o8/id?id=xxx';
      var name = 'John Doe';
      var email = 'john.doe@unknown.com';
      dbAccess.addUser(googleId, name, email, function (result) {
        dbAccess.addUser(googleId, name, email, function (result) {
          dbAccess.getAllUsers(function (users) {
            testHelpers.validateOkResult(users);
            users.data.length.should.equal(1);
            done();
          });
        });
      });
    });

    it("the user should get a niffty nickname", function (done) {
      var googleId = 'https://www.google.com/accounts/o8/id?id=xxx';
      var name = 'John Doe';
      var email = 'john.doe@unknown.com';
      dbAccess.addUser(googleId, name, email, function (result) {
        result.data.nickname.should.equal('johndoe');
        done();
      });
    });
  });
});