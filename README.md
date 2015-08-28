AptiTalk
========

Setup Windows Environment
-------------------------
`VERY IMPORTANT!!! RUN THE COMMAND PROMPT AS ADMINISTRATOR WHEN FOLLOWING THESE STEPS`

1. Install Chocolatey - https://chocolatey.org/
2. Install Git using Chocolatey - cinst git
3. Install Windows Credential Store for Git - http://gitcredentialstore.codeplex.com/
4. Clone AptiTalk repo - in command prompt where you want the repo write 
   `git clone https://github.com/aptitud/AptiTalk.git`

  ```
  C:\Git>git clone https://github.com/aptitud/AptiTalk.git
  Cloning into 'AptiTalk'...
  remote: Counting objects: 369, done.
  remote: Compressing objects: 100% (232/232), done.
  rRemote: Total 369 (delta 206), reused 224 (delta 123)
  Receivin204.00 KiB | 177.00 KiB/s
  Receiving objects: 100% (369/369), 293.26 KiB | 177.00 KiB/s, done.
  Resolving deltas: 100% (206/206), done.
  Checking connectivity... done.
  ```
5. Install Node using Chocolatey - cinst nodejs
6. Install MongoDB using Chocolatey - cinst mongodb
7. Go to the AptiTalk repo `C:\Git>cd AptiTalk`
7. In the AptiTalk repo directory - `C:\Git\AptiTalk` run the following: `npm install`
8. In the AptiTalk repo directory - `C:\Git\AptiTalk` run the following: `npm install nodemon -g`

Setup OS X Environment
----------------------
PREREQUISITES (perform if necessary):  
1. Install Homebrew - http://brew.sh/  
2. Install git using Homebrew - `brew install git`  
3. Install Node.js using Homebrew  - `brew install node`  
4. Install nodemon globally using NPM - `npm install nodemon -g`  
4. Install MongoDB using Homebrew - `brew install mongodb`  
5. Run MongoDB daemon - `mongod --config /usr/local/etc/mongod.conf`  

APTITALK  
1. Clone AptiTalk repo - in Terminal where you want the repo write  
   `git clone https://github.com/aptitud/AptiTalk.git`  
2. In the cloned repo directory, install the Node.js modules - `npm install`  

Start AptiTalk (Dev mode)
-------------------------
In the AptiTalk repo directory - `C:\Git\AptiTalk` run the following: `nodemon server.js`
This will start AptiTalk in dev mode see https://github.com/aptitud/AptiTalk/blob/master/config/index.js for more info

Start AptiTalk (Prod mode)
--------------------------
In the AptiTalk repo directory - `C:\Git\AptiTalk` run the following: `npm start`
This will start AptiTalk in prod mode see https://github.com/aptitud/AptiTalk/blob/master/config/index.js for more info

Run Tests
---------
In the AptiTalk repo directory - `C:\Git\AptiTalk` run the following: `npm test`

Contribute
----------
Please file any issues under issues and use branch/pull request to get new features/fixes into master

Dev settings
------------
We use space instead of tabs as indentation

We use 2 spaces instead of 4

Thanks






