"use strict";
import express from "express";
import mysql2 from "mysql2";

export function chickenRunServer(port, host) {
    const server = express();
    server.use(express.json());
    server.use(express.text());

    const database = mysql2.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password123",
        database: "chicken_run",
    });

    database.connect();

    // Drop potential table
    database.query('DROP TABLE chicken;');

    // Create table in DB
    database.query(
        `CREATE TABLE chicken
                (name varchar(255) NOT NULL,
                 birthday TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 weight real NOT NULL,
                 steps int DEFAULT 0,
                 isRunning boolean DEFAULT false
                );`,
        function(error, results, field) {
            if (error) {
                throw error;
            }
    });

    // List of endpoints

    // Reply with farmyard list of chickens
    server.get('/chicken', async(request, reply) => {
        reply.writeHead(200, {'Content-type': 'application/json'});
        database.query('SELECT * FROM chicken;',
            function(error, results) {
                if (error) {
                    throw error;
                }
                reply.end(JSON.stringify(results));
            });
    });

    // Add a chicken to the farmyard
    server.post('/chicken', async(request, reply) => {
        const requestBody = parseRequest(request.body);
        let queryResult;

        // Mandatory fields not correct
        if (typeof requestBody === "string") {
            reply.writeHead(422, {'Content-type': 'text/plain'});
            reply.end();
        } else {
            database.query('INSERT INTO chicken (name, weight) VALUES (' +
                database.escape(requestBody.name) + ', ' +
                database.escape(requestBody.weight) + ');',
                function(error, results) {
                    if (error) {
                        throw error;
                    }
                    queryResult = results;
                    reply.writeHead(200, {'Content-type': 'application/json'});
                    reply.end();
                }
            );
        }
    });

    // Replace a chicken in the farmyard
    server.put('/chicken', async(request, reply) => {
        const requestBody = request.body;
        if (requestBody.steps === undefined) {
            requestBody.steps = 0;
        }

        // Mandatory fields not correct
        if (typeof requestBody.name !== "string" || typeof requestBody.weight !== "number") {
            reply.writeHead(422);
            reply.end();
        } else {
            database.query('UPDATE chicken ' +
               'SET birthday = ' + database.escape(requestBody.birthday) + ',' +
                   'weight = ' + database.escape(requestBody.weight) + ', '+
                   'steps = ' + database.escape(requestBody.steps) + ', ' +
                   'isRunning = ' + database.escape(requestBody.isRunning) + ' '+
               'WHERE name = ' + database.escape(requestBody.name) + ';',
                function(error) {
                    if (error) {
                        throw error;
                    }
                    reply.writeHead(200);
                    reply.end();
                }
            );
        }
    });

    // Change birthday of an existing chicken
    server.patch('/chicken', async(request, reply) => {
        const requestBody = request.body;
        requestBody.birthday = (new Date(requestBody.birthday))

        database.query('UPDATE chicken ' +
               'SET ' +
                   'birthday = ' + database.escape(requestBody.birthday) +
                'WHERE name = ' + database.escape(requestBody.name) + ';',
            function(error) {
                if (error) {
                    throw error;
                }

                reply.writeHead(200);
                reply.end();
            }
        );
    });

    // Delete an existing chicken
    server.delete('/chicken', async(request, reply) => {
        const requestBody = request.body;

        // Delete right named chickens
        database.query('DELETE FROM chicken ' +
                'WHERE name = ' + database.escape(requestBody.name) + ';',
            function(error) {
                if (error) {
                    throw error;
                }

                reply.writeHead(200);
                reply.end();
            }
        );
    });

    // Increments steps, and update isRunning to true
    server.post('/chicken/run', async(request, reply) => {
        const requestBody = request.body

        database.query('UPDATE chicken ' +
                'SET ' +
                   'steps = steps + 1,' +
                   'isRunning = true ' +
                'WHERE name = ' + database.escape(requestBody.name) + ';',
            function(error) {
                if (error) {
                    throw error;
                }

                reply.writeHead(200);
                reply.end();
            }
        );
    });

    server.listen(port, host);
    console.log(`Server running at http://${host}:${port}/`);
    return server;
}

function parseRequest(bodyObject) {
    // Mandatory fields not correct
    if (typeof bodyObject.name !== "string") {
        return 'Field name requires a string';
    } else if (typeof bodyObject.weight !== "number") {
        return 'Field weight requires a number';
    }

    return {
        name: bodyObject.name, //Required
        birthday: new Date, // Current time
        weight: bodyObject.weight, //Required
        steps: 0, //Default
        isRunning: false, //Default
    };
}