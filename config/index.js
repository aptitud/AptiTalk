var config = {
    local: {
        mode: 'local',
        port: 3000,
        mongoUrl : "mongodb://localhost:27017/AptiTalk_Dev"
    },
    staging: {
        mode: 'staging',
        port: 4000,
        mongoUrl : "mongodb://localhost:27017/AptiTalk_Test"
    },
    prod: {
        mode: 'prod',
        port: 5000,
        mongoUrl : "mongodb://localhost:27017/AptiTalk_Dev"
    }
};

module.exports = function(mode) {
    return config[mode || process.argv[2] || 'local'] || config.local;
};