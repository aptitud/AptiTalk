var mongoDevUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Dev";
var mongoStageUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Test";
var mongoProdUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Prod";
var appPort = Number(process.env.PORT || 2013);
var realm = process.env.PORT ? 'http://lit-tundra-5550.herokuapp.com' : ('http://192.168.1.4:' + appPort);
var returnUrl = (realm + '/auth/google/return');

var config = {
  local: {
    appPort: appPort,
    realm: realm,
    returnUrl: returnUrl,
    authentication: 'none',
    internet: false,
    mode: 'local',
    port: 3000,
    mongoUrl: mongoDevUri
  },
  staging: {
    appPort: appPort,
    realm: realm,
    returnUrl: returnUrl,
    authentication: 'none',
    internet: false,
    mode: 'staging',
    port: 4000,
    mongoUrl: mongoStageUri
  },
  prod: {
    appPort: appPort,
    realm: realm,
    returnUrl: returnUrl,
    authentication: 'google',
    internet: true,
    mode: 'prod',
    port: 5000,
    mongoUrl: mongoProdUri
  }
};

module.exports = function (mode) {
  return config[mode || process.argv[2] || 'local'] || config.local;
};