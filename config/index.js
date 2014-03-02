var config = {
  local: {
    mode: 'local',
    port: 3000,
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Dev"
  },
  staging: {
    mode: 'staging',
    port: 4000,
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Test"
  },
  prod: {
    mode: 'prod',
    port: 5000,
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/AptiTalk_Prod"
  }
};

module.exports = function (mode) {
  console.log('process.argv', process.argv[2]);
  return config[mode || process.argv[2] || 'local'] || config.local;
};