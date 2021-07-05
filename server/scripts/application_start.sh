sudo chmod -R 777 /home/ec2-user/express-app

cd /home/ec2-user/express-app

export NVM_DIR="$HOME/.nvm"
[ -s "NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "NVM_DIR/bash_completion.sh" ] && \. "$NVM_DIR/bash_completion.sh"

npm install

node server.js > server.out.log 2> app.err.log < /dev/null &