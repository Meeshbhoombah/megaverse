/**
 * src/app.ts
 *
 * Makes requests to Crossmint's Megaverse service to build a map based off the 
 * Goal map provided by Crossmint. 
 *
 */

import * as https from 'https';

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

        let rowNumber = 0;
        let columnNumber = 0;

        for (let row of map) {
            console.log("Row: ", rowNumber);

            for (let column of row) {
                console.log("Column: ", columnNumber);
                console.log(column);
                columnNumber++; 
            }

            // Reset column numbering for the next row
            columnNumber = 0;

            rowNumber++;
        }

    });
});

