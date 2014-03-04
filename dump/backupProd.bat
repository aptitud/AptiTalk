mongodump --host troup.mongohq.com:10037 --db AptiTalk -u admin -pPassw0rd -o C:/git/AptiTalk/dump
mongorestore -d AptiTalk_Dev C:/git/AptiTalk/dump/AptiTalk
