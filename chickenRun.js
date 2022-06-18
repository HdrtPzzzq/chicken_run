"use strict";
import express from "express"

export function chickenRunServer(port, host) {
    const server = express();
    server.use(express.json());
    server.use(express.text());

    let farmyard = [];

    // List of endpoints

    // Reply with farmyard list of chicken
    server.get('/chicken', async(request, reply) => {
        reply.writeHead(200, {'Content-type': 'application/json'});
        reply.end(JSON.stringify(farmyard));
    });

    // Add a chicken to the farmyard
    server.post('/chicken', async(request, reply) => {
        const requestBody = parseRequest(request.body);

        // Mandatory fields not correct
        if (typeof requestBody === "string") {
            reply.writeHead(422, {'Content-type': 'text/plain'});
            reply.end(requestBody);
        } else {
            farmyard.push(requestBody);

            reply.writeHead(200, {'Content-type': 'application/json'});
            reply.end(JSON.stringify(farmyard));
        }
    });

    // Replace a chicken in the farmyard
    server.put('/chicken', async(request, reply) => {
        const requestBody = request.body;

        // Mandatory fields not correct
        if (typeof requestBody.name !== "string" || typeof requestBody.weight !== "number") {
            reply.writeHead(422);
        } else {
            farmyard = farmyard.map(chickenElement => {
                if (chickenElement.name === requestBody.name)
                {
                    return {
                        name: requestBody.name,
                        birthday: requestBody.birthday,
                        weight: requestBody.weight,
                        steps: requestBody.steps,
                        isRunning: requestBody.isRunning,
                    };
                }
            });

            reply.writeHead(200);
        }

        reply.end();
    });

    // Change birthday of an existing chicken
    server.patch('/chicken', async(request, reply) => {
        const requestBody = request.body;

        farmyard = farmyard.map(chickenElement => {
            if (chickenElement.name === requestBody.name)
            {
                chickenElement.birthday = (new Date(requestBody.birthday)).toLocaleDateString();
                return chickenElement;
            }
        });

        reply.writeHead(200);
        reply.end();
    });

    // Delete an existing chicken
    server.delete('/chicken', async(request, reply) => {
        const requestBody = request.body;

        // Delete right named chickens
        farmyard = farmyard.filter(chickenElement => chickenElement.name !== requestBody.name)

        reply.writeHead(200);
        reply.end();
    });

    // Increments steps, and update isRunning to true
    server.post('/chicken/run', async(request, reply) => {
        const requestBody = request.body

        // Update everyone in case of no given name
        if (!requestBody.name) {
            for (let chicken of farmyard) {
                chicken.steps++;
                chicken.isRunning = true;
            }
        }

        // Get chicken by name
        const chicken = farmyard.find(chickenElement => chickenElement.name === requestBody.name);

        // Update right chicken
        if (chicken){
            chicken.steps++;
            chicken.isRunning = true;
            reply.writeHead(200);
        } else {
            reply.writeHead(422);
        }

        reply.end();
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
        birthday: (new Date).toLocaleDateString(), // Current time
        weight: bodyObject.weight, //Required
        steps: 0, //Default
        isRunning: false, //Default
    };
}