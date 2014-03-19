REM mongodump --host troup.mongohq.com:10037 --db AptiTalk -u admin -pPassw0rd -o C:/git/AptiTalk/dump
mongo AptiTalk_Dev --eval "db.dropDatabase()"
mongo AptiTalk_Prod --eval "db.dropDatabase()"
mongorestore -d AptiTalk_Dev C:/git/AptiTalk/dump/AptiTalk
mongorestore -d AptiTalk_Prod C:/git/AptiTalk/dump/AptiTalk
