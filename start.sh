#!/bin/bash
 
 RED='\033[0;31m'
 GREEN='\033[0;32m'
 NC='\033[0m' # No Color
 
 # stop an existing server (if there is any)
 echo -e "stopping existing Bounc-server (if there is any)..."
 forever stop ./index.js
 
 # delete existing log files
 echo -e "cleaning older logs..."
 rm -f ./*.log
 # if env file is present, source it
 if [ -f "./bounce-env" ]
 then
     set -o allexport
     source ./bounce-env
     set +o allexport
 else
 echo -e "${RED}can't find gpi-env file...${NC}"
 echo -e "Bye!"
 exit
 fi
 
 # Removing the forever in local for printing the console logs.
 # If required, same can be retained for forever in local as well.
 
 echo "Node environement: $NODE_ENV"
 if [ $NODE_ENV == "local" ]
 then
     nodemon ./index.js
 else
     # start the server
     forever -p ./ -a -l forever.log -o ./server.log -e ./error.log start ./index.js
 
     echo -e "\n\n\t--to see analytics-server console logs run this command: tail -f ./server.log\n\n"
 fi
 
 echo -e "Done!"