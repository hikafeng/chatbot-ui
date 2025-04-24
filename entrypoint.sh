#!/bin/bash



# if you are using windows, you may need to convert the file to unix format
# you can use the Ubuntu terminal to convert this file to unix format
# otherwise, you may get the error after running the docker container

# sudo apt-get install dos2unix
# dos2unix entrypoint.sh


set -e

export NEXT_PUBLIC_SUPABASE_SERVER_URL=
export NEXT_PUBLIC_SUPABASE_URL=

pm2 start /app/web/server.js --name chatbot-ui --cwd /app/web -i ${PM2_INSTANCES} --no-daemon