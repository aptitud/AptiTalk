mongodump -h localhost:27017 -d AptiTalk_Prod -o local

REM mongo troup.mongohq.com:10037/AptiTalk  -u admin -p Passw0rd --eval "db.dropDatabase()"

mongorestore -h troup.mongohq.com:10037 -d AptiTalk -u admin -p Passw0rd c:/git/AptiTalk/dump/local/AptiTalk_Prod

