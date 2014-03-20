var config = require(__dirname + '/../config')();
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function (req, res, next) {
  if (config.authentication !== 'google') {
    return next();
  }

  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
};

exports.verifyUser = function (email, next) {
  var regex = /^((\w+)\.(\w+)@aptitud\.se)$/i;
  var match = regex.exec(email);
  if (match === null) {
    next("You need to be a valid Aptitud user", false);
    return;
  }

  next(null, true);
};