# server-js

## Installation and running

* Install Docker
* Build the image by cd'ing into the root directory (where Dockerfile lives) and
`sudo docker build -t fydp/server-js .`
* `sudo docker run -p 49160:8080 -d fydp/server-js`

## Docker stuff

Check built docker images via `docker images`

Check running docker containers via `docker ps`

Start and stop running docker containers via `start/stop docker [hash]`

Run a shell to the docker container `sudo docker run --rm -it fydp/server-js bash`

Also if you get error message on mac about daemon not running, run the quickstart terminal and run
```
docker-machine start default
eval "$(docker-machine env default)"
```

## Relevant links

https://docs.docker.com/examples/nodejs_web_app/
http://seanmcgary.com/posts/deploying-a-nodejs-application-using-docker

## RethinkDB
* To run RethinkDB, run `rethinkdb` which will also allow you to view configuration, database info, etc. from localhost:8080
* For the drawing app (demo project), run `node app.js` from the drawing-game folder. This will run the webapp in localhost:3000
