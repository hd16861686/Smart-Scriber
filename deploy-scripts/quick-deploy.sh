#!/bin/bash

# quickly commit and deploy to server
git add .
git commit -am "Quick front-end deploy"
# live pushes to the server automatically that is setup via git init --bare
git push live master