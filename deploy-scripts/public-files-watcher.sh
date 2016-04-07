#!/bin/bash
# exclude .git folder from watch since quick-deploy updates .git, thus creating infinite execution of script
# also only watch changes from public directory
fswatch -o -e .git ./../public | xargs -n1 ./quick-deploy.sh
