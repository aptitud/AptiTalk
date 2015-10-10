var mongoDevUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Dev";
var mongoStageUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Test";
var mongoProdUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Prod";
var appPort = Number(process.env.PORT || 2013);
var client = process.env.PORT ? '724017344869-024r6smugkc8pm0pdbedqvgmd7d975nj.apps.googleusercontent.com' : '724017344869-j5tsp6sbus8b052q9cpcjhhv1f1m34u0.apps.googleusercontent.com';
var api = 'AIzaSyCvVOKAbnX258n3pwQL3uOnG6zJejFc28Q';

var config = {
  local: {
    appPort: appPort,
    authentication: 'google',
    internet: true,
    mode: 'local',
    port: 3000,
    mongoUrl: mongoDevUri,
    client: client,
    api: api
  },
  staging: {
    appPort: appPort,
    authentication: 'none',
    internet: false,
    mode: 'staging',
    port: 4000,
    mongoUrl: mongoStageUri,
    client: client,
    api: api
  },
  prod: {
    appPort: appPort,
    authentication: 'google',
    internet: true,
    mode: 'prod',
    port: 5000,
    mongoUrl: mongoProdUri,
    client: client,
    api: api
  }
};

module.exports = function (mode) {
  return config[mode || process.argv[2] || 'local'] || config.local;
};