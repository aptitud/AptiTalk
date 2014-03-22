var mongoose = require("mongoose");
var dbAccess = require("../lib/dbAccess/dbAccess");
var testHelpers = require("./dbAccess/testHelpers.js");
var should = require("should");

describe('User serialization and deserialization', function () {
  var googleUser = {
    displayName: 'Hugo Häggmark',
    email: 'hugo.haggmark@aptitud.se',
    name: {
      familyName: 'Häggmark',
      givenName: 'Hugo'
    },
    id: '12345678ABCDEFGH',
    image: {
      url: 'https://lh3.googleusercontent.com/photo.jpg?sz=50'
    }
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
      dbAccess.serializeUser(googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        should.exists(user._id);
        user.displayName.should.equal(googleUser.displayName);
        user.email.should.equal(googleUser.email);
        user.givenName.should.equal(googleUser.name.givenName);
        user.familyName.should.equal(googleUser.name.familyName);
        user.nickName.should.equal('hugohaggmark');
        user._id.should.equal(googleUser.id);
        done();
      });
    });

    it('the user should be unique', function (done) {
      dbAccess.serializeUser(googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        dbAccess.serializeUser(googleUser, function (err, user) {
          should.not.exists(err);
          should.exists(user);
          dbAccess.serializeUser(googleUser, function (err, user) {
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
      dbAccess.serializeUser(googleUser, function (err, user) {
        should.not.exists(err);
        should.exists(user);
        dbAccess.deserializeUser(user._id, function (err, deserializedUser) {
          should.not.exists(err);
          should.exists(deserializedUser);
          should.exists(deserializedUser._id);
          deserializedUser.displayName.should.equal(googleUser.displayName);
          deserializedUser.email.should.equal(googleUser.email);
          deserializedUser.givenName.should.equal(googleUser.name.givenName);
          deserializedUser.familyName.should.equal(googleUser.name.familyName);
          deserializedUser.nickName.should.equal('hugohaggmark');
          deserializedUser._id.should.equal(googleUser.id);
          done();
        });
      });
    });
  });
});