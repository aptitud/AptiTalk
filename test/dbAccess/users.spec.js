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
      dbAccess.addUser(testHelpers.TESTUSER.identifier, testHelpers.TESTUSER.name, testHelpers.TESTUSER.email, function (result) {
        testHelpers.validateOkResult(result);
        should.exists(result.data._id);
        result.data.identifier.should.be.equal(testHelpers.TESTUSER.identifier);
        result.data.name.should.be.equal(testHelpers.TESTUSER.name);
        result.data.email.should.be.equal(testHelpers.TESTUSER.email);
        done();
      });
    });

    it("if user already exists then it should not add a new user", function (done) {
      dbAccess.addUser(testHelpers.TESTUSER.identifier, testHelpers.TESTUSER.name, testHelpers.TESTUSER.email, function (result) {
        dbAccess.addUser(testHelpers.TESTUSER.identifier, testHelpers.TESTUSER.name, testHelpers.TESTUSER.email, function (result) {
          dbAccess.getAllUsers(function (users) {
            testHelpers.validateOkResult(users);
            users.data.length.should.equal(1);
            done();
          });
        });
      });
    });

    it("the user should get a niffty nickname", function (done) {
      dbAccess.addUser(testHelpers.TESTUSER.identifier, testHelpers.TESTUSER.name, testHelpers.TESTUSER.email, function (result) {
        result.data.nickname.should.equal('johndoe');
        done();
      });
    });

    it("the user must have an identifier, name and email", function (done) {
      dbAccess.addUser("", testHelpers.TESTUSER.name, testHelpers.TESTUSER.email, function (result) {
        testHelpers.validateErrorResult(result, "User must");
        dbAccess.addUser(testHelpers.TESTUSER.identifier, "", testHelpers.TESTUSER.email, function (result) {
          testHelpers.validateErrorResult(result, "User must");
          dbAccess.addUser(testHelpers.TESTUSER.identifier, testHelpers.TESTUSER.name, "", function (result) {
            testHelpers.validateErrorResult(result, "User must");
          });
        });
        done();
      });
    });
  });
});