/**
 * src/app.ts
 *
 * Makes requests to Crossmint's Megaverse service to build a map based off the 
 * Goal map provided by Crossmint. 
 *
 */

import * as http from 'http';
import * as https from 'https';
import * as process from 'process';

const API = 'https://challenge.crossmint.com/api'
const GOAL = API + `/map/${process.env.CANDIDATE_ID}/goal`;

// The Goal map is hidden behind an endpoint that can be fetched with a simple 
// HTTP `GET` request. This map is simply JSON data that can be parsed into an
// Matrix of "Rows" and "Columns."
https.get(GOAL, (res) => {
    res.on('data', (data) => {

        // Upon inspecting the headers of responses from Crossmint's Megaverse 
        // service, I found the character set to be `utf-8.` As a result, we can 
        // simply convert incoming raw data buffers from Crossmint via `utf-8`, 
        // as is necessary when making `https` requests with `Node.`
        let rawMap = data.toString('utf8');

        // The Goal map is a raw JSON, hidden behind a key, "goal"
        let map = JSON.parse(rawMap).goal;

        // The 2D spaces that are creatable by making `POST` requests to 
        // Crossmint's Megaverse service are numbered starting at 0
        let rowNumber = 0;
        let columnNumber = 0;

        for (let row of map) {

            for (let column of row) {

                if (column == 'SPACE') {
                    process.stdout.write('🌌 ');
                } 

                if (column == 'POLYANET') {
                    process.stdout.write('🪐 ') 
                }

                columnNumber++; 
            }

            process.stdout.write('\n');

            // Reset column numbering for the next row in the 2D space
            columnNumber = 0;

            rowNumber++;
        }

        process.stdout.write('\n');
    });
});

const POST_DATA = JSON.stringify({
    'row': '2',
    'column': '2',
    'candidateId': `process.env.CANDIDATE_ID`
});

let hostname = `crossmint.challenge.com`;

const options = {
    hostname,
    path: `/api/polyanets`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(POST_DATA),
    },
};

console.log(options);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });

    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(POST_DATA);
req.end();

