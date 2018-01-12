# Deploying Day2Day
This piece of documentation aims at deploying the app easily on Digital cloud
Doc done with the help of this [video](https://youtu.be/_GSOnHRYSS0)

## Set up
### Digital Ocean
From what I could see, Digital Ocean is simpler to sign in using SSL without an app running on it (which is not the case with CloudFoundry for exemple). Create a server using ubuntu

### Putty
Simply because I was not able to use SSH login I had to go trough the use of Putty to log in to my machine. You will need both Putty AND Putty gen (the latter will create the SSH keys for you) to deploy on a new server.

## Misc
Make sure your app is running on port 80 or env.port.
Mongo will be installed in home directory whereas the app will be in a day2day dir

## Additionnal documentation
* [MongoDB install on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* [NodeJS install on ubuntu](https://nodejs.org/en/download/package-manager/)

## Deploying Day2Day
1. Create SSH keys
1. Open Putty and log in to your machine using its IP, "root" as a user name and tell Putty to use your keys by going to Connection > SSH > Auth and give it the private key putty gen generated
1. Save the config and run
1. Agree to the error message that will pop up. You're now in the server
1. You now need to install nodejs. To do so use `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -` to install node 
1. Now `sudo apt-get install -y nodejs` to install the latest stable version of NodeJS
1. Now install MongoDB. To do so `sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5` then `echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list`. 
1. Now update mongo to last stable version `sudo apt-get update` and finally `sudo apt-get install -y mongodb-org`. 
1. Now start mongodb using `sudo service mongod start`
1. Now you need to clone Git repo into the server. To do so `git clone https://github.com/Armitage35/day2day.git`. You then need to access the day2day folder by using `cd day2day`
1. Then install all of your packages and dependencies by running `npm install`
1. You should then be able to `npm start` to start the app on port 3000. You can now use the app on port `:3000`.
1. You now want to make the app run as a service in order to be able to use the terminal to do other stuff. To do so stop the app and the `npm install pm2 -g`. You can now use `pm2 start server.js` to start the app and `pm2 stop server.js` to shut the app down.
1. Now since you want to run the app on default port `:80` and not have to mention the port you want to be using. To do that run `sudo apt-get install lib2cap-bin`
1. Now stop the app and run ```sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``` to enable the app to run without having to use the port you used

## Restarting app
**Remember**
* Mongo is install in the main directory, not in Day2Day folder. To start mongo just use `./mongod` in the home directory
* You want to be using PM2 to launch the app so that you can still access the terminal to do stuff, so use `pm2 start server.js`
* * To stop Day2Day, use `pm2 stop server.js` in day2day directory