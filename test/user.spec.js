var mongoose = require("mongoose");
var dbAccess = require("../lib/dbAccess/dbAccess");
var testHelpers = require("./dbAccess/testHelpers.js");
var should = require("should");

describe('User serialization and deserialization', function () {

  var verifyGoogleUser = function (err, user) {
    should.not.exists(err);
    should.exists(user);
    should.exists(user._id);
    user.displayName.should.equal(testHelpers.googleUser.displayName);
    user.email.should.equal(testHelpers.googleUser.email);
    user.givenName.should.equal(testHelpers.googleUser.name.givenName);
    user.familyName.should.equal(testHelpers.googleUser.name.familyName);
    user.nickName.should.equal('hugohaggmark');
    user._id.should.equal(testHelpers.googleUser.id);
  };

  beforeEach(function (done) {
    testHelpers.deleteAll();
    done();
  });

  after(function (done) {
    testHelpers.deleteAll();
    done();
  });

  describe('When serializating a google user', function () {
    it('the user should be correctly stored', function (done) {
      dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
        done(verifyGoogleUser(err, user));
      });
    });

    it('the user should be unique', function (done) {
      dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
          should.not.exists(err);
          should.exists(user);
          dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
            should.not.exists(err);
            should.exists(user);
            dbAccess.getAllUsers(function (err, users) {
              should.not.exists(err);
              should.exists(users);
              users.length.should.equal(1);
              done();
            });
          });
        });
      });
    });
  });

  describe('When deserializating a google user', function () {
    it('the user should be correctly deserialized', function (done) {
      dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        dbAccess.deserializeUser(user._id, function (err, deserializedUser) {
          done(verifyGoogleUser(err, user));
        });
      });
    });
  });

  describe('Get serialized user by nickName', function () {
    it('the user should be correctly deserialized', function (done) {
      dbAccess.serializeUser(testHelpers.googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        dbAccess.getUserByNickName(user.nickName, function (err, user) {
          done(verifyGoogleUser(err, user));
        });
      });
    });
  });
});