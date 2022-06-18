# Chicken Run
## Set up
* `git clone git@github.com:HdrtPzzzq/chicken_run.git`
* `cd chicken_run`

Install Dependencies with
* `npm install`

Create MySQL server and connect a client
* `docker run -it -e MYSQL_ROOT_PASSWORD=password123 -v $PWD/data:/var/lib/mysql -p 3306:3306 mysql
`
* `mysql -uroot -h127.0.0.1 -ppassword123 -P3306`

Once connected to the client, create a Database
* `CREATE DATABASE chicken_run;`

Start the back-end server on `localhost:5050` by default
* `npm run start`

## Routes

There are two routes
* `/chicken`
* `/chicken/run`

For both of these routes JSON data must be sent

### Chicken's endpoints

#### GET  
Send a reply with all the chicken
* `curl localhost:5050/`
#### POST
Create a new chicken
* `curl -X POST -H 'Content-type: application/json' -d '{"name": "firstChicken", "weight": 3.5}' localhost:5050/chicken`
#### PUT
Replace an existing chicken
* `curl -X PUT -H 'Content-type: application/json' -d '{"name": "firstChicken", "weight": 4}' localhost:5050/chicken`
#### PATCH
Change the isRunning state of an existing chicken
* `curl -X PATCH -H 'Content-type: application/json' -d '{"isRunning": true}' localhost:5050/chicken`
#### DELETE
Delete an existing chicken
* `curl -X DELETE -H 'Content-type: application/json' -d '{"name": "firstChicken"}' localhost:5050/chicken`

### Chicken run's endpoints

#### POST
If a json with a name field is sent, increments all chicken's steps named that way.
* `curl -X POST -H 'Content-type: application/json' -d '{"name": "firstChicken"}' localhost:5050/chicken/run`