/**
 *
 * src/app.ts
 *
 * Makes `POST` requests to Crossmint's Megaverse service to build a map based
 * off a `GET` request to the service's endpoint `/map/{CANDIDATE_ID}/goal`, 
 * which returns a "Goal" map to be recreated through these `POST` requests
 *
 */

import * as https from 'https';
import * as fs from 'fs';
import * as process from 'process';


// URL for the Crossmint Megaverse service API
const API = 'https://challenge.crossmint.com/api';
// The targeted map that `megaverse` will recreate by making post requests to 
// Crossmint's Megaverse service, requestable from the service via a `GET` 
// request with a `CANDIADATE_ID` given to a Candidate from a recruiter in an
// email to the interviewee
const GOAL = API + `/map/${process.env.CANDIDATE_ID}/goal`;

const MAKE_REQUEST = process.env.MAKE_REQUEST;


/**
 *
 * Helper function, makes a `POST` request to the Crossmint Service, placing an 
 * entity at a specific coordinate point (rowNumber, columnNumber) in a 
 * creatable map obfuscated by the API we are posting to (i.e: the map is 
 * located in Crossmint's service, and `megaverse` works with it abstractly).
 *
 * @param {string} endpoint - one of the endpoints of the Crossmint service: 
 *                 `/polyanets`, `/soloons`, or `/comeths`
 * @param {string} rowNumber
 * @param {string} columnNumber
 * @param {object} args? - Some endpoints (i.e: `/soloons` and `/comeths`) 
 *                 require further arguments, respectively: `color` and 
 *                 `direction`, which can be sent to the Crossmint service by 
 *                 passing an object assigning the key of said argument to the
 *                 requisite value (e.g: args = { color: 'red' }
 *               
 */
function post(
    endpoint: string, 
    rowNumber: number, 
    columnNumber: number,
    args?: object,
) {

    let data = JSON.stringify({
        row: rowNumber,
        column: columnNumber, 
        candidateId: process.env.CANDIDATE_ID,
        ...args
    });

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        }
    };

    let req = https.request(API + endpoint, options, (res) => {

        console.log('POST: ', endpoint);
        console.log(options);
        console.log(res.statusCode);
        console.log(res.headers);

        if (res.statusCode == 429) {
            post(endpoint, rowNumber, columnNumber, args);
        }

    });

    req.on('error', (e) => {
        console.error('`POST` request error: ', e.message);
    });

    req.write(data);
    req.end();

};


// The Goal map can be fetched with a HTTP `GET` request to the service's
// endpoint, `/api/map,` if a Candidate ID is passed to the request. You can 
// obtain a Candidate ID from a recruiter.
//
// This resulting response's data from the request is formatted with JSON. When
// parsed, it creates a 2D space, or an array-based matrix, of "Rows" and 
// "Columns," which can be formed into a Map.
https.get(GOAL, (res) => {
    
    // The readable stream for the response can be a set of chunks, thus we must 
    // read all parts of it (i.e: `res.on('data', ...`) before we can, upon the 
    // response's end, take action on the Goal map.
    let rawMap = "";
    res.on('data', (data) => {
        // Inspecting the headers of responses from Crossmint's Megaverse 
        // service, I found the character set to be `utf-8.` As a result, we can 
        // simply pass this character set to convert incoming raw data buffers 
        // from Crossmint service. Otherwise, the raw returned `ClientRequest` 
        // readable Stream is what we would have to work with when creating a
        // Map for the submission.
        //
        // Learn More:
        // https://nodejs.org/api/http.html#class-httpclientrequest
        rawMap += data.toString('utf-8');
    });

    res.on('end', async() => {
        // The Goal map is raw JSON string, with its workable contents hidden 
        // behind a key, "goal"
        let map = JSON.parse(rawMap).goal;

        // The 2D spaces that are creatable by making `POST` requests to 
        // Crossmint's Megaverse service are numbered starting at 0
        let rowNumber = 0;
        let columnNumber = 0;

        // Iterate over the Goal Map string-based array Matrix to get to each
        // entity contained within the map
        for (let row of map) {
            for (let entity of row) {

                // To create the final submittable Map with Crossmint's 
                // megaverse service, we need to `POST` each individual entity
                // to its corresponding `endpoint,` as is specified by
                // Crossmint's provided API 
                let endpoint!: string;
                let args!: object;

                if (entity == 'POLYANET') {
                    endpoint = '/polyanets'; 
                    process.stdout.write('🪐 ');
                }

                if (entity.slice(-6) == 'SOLOON') {
                    endpoint = '/soloons';
                    
                    switch(entity[0]) {
                        case 'B': {
                            args = { color: 'blue' };
                            break;
                        }
                        case 'R': {
                            args = { color: 'red' };
                            break;
                        }
                        case 'P': {
                            args = { color: 'purple' };
                            break;
                        } 
                        case 'W': {
                            args = { color: 'white' };
                            break;
                        }
                    }

                    process.stdout.write('🌕 ');
                }

                if (entity.slice(-6) == 'COMETH') {
                    endpoint = '/comeths';

                    switch(entity[0]) {
                        case 'U': {
                            args = { direction: 'up' };
                            break;
                        }
                        case 'D': {
                            args = { direction: 'down' };
                            break;
                        }
                        case 'L': {
                            args = { direction: 'left' };
                            break;
                        }
                        case 'R': {
                            args = { direction: 'right' };
                            break;
                        }
                    }

                    process.stdout.write('☄️ ');
                }

                if (entity == 'SPACE') {
                    process.stdout.write('🌌 ');                
                };

                post(endpoint, columnNumber, rowNumber, args);

                // Move to the next column
                columnNumber++; 
            }

            // End of a row in our output is demarcated with a new line
            process.stdout.write('\n');

            // Reset column numbering for the next row in the 2D space
            columnNumber = 0;

            // Move to the next row
            rowNumber++;
        }

        process.stdout.write('\n');
    });

});

