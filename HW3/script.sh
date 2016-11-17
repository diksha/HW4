#!/bin/bash
PORT="$1"
docker build -t newfile/new /Users/dikshagohlyan/devops/HW4/HW3/ 
docker run -d -p $PORT:3000 newfile/new 
