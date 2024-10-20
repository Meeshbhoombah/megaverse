/**
 * src/app.ts
 *
 * Makes requests to Crossmint's Megaverse service to build a map based off the 
 * Goal map provided by Crossmint. 
 *
 */

import * as https from 'https';
import * as fs from 'fs';
import * as process from 'process';


const API = 'https://challenge.crossmint.com/api';
const GOAL = API + `/map/${process.env.CANDIDATE_ID}/goal`;

const MAKE_REQUEST = process.env.MAKE_REQUEST;


// The Goal map can be fetched with a HTTP `GET` request to the service's
// endpoint, `/api/map.` This map is formatted as JSON data. When parsed, 
// it creates a 2D space, or an array-based matrix, of "Rows" and "Columns."
https.get(GOAL, (res) => {

    // The readable stream for the Goal map's response can be a set of chunks,
    // thus we must read all parts of it (i.e: `res.on('data', ...`) before we
    // can, upon the response's end, take action on the Goal map
    
    let rawMap = "";
    res.on('data', (data) => {

        // Upon inspecting the headers of responses from Crossmint's Megaverse 
        // service, I found the character set to be `utf-8.` As a result, we can 
        // simply convert incoming raw data buffers from Crossmint via `utf-8`, 
        // as is necessary when making `https` requests with `Node.`
        rawMap += data.toString('utf-8');

    });

    res.on('end', async() => {

        // The Goal map is raw JSON, hidden behind a key, "goal"
        let map = JSON.parse(rawMap).goal;

        // The 2D spaces that are creatable by making `POST` requests to 
        // Crossmint's Megaverse service are numbered starting at 0
        let rowNumber = 0;
        let columnNumber = 0;

        for (let row of map) {
            for (let entity of row) {

                let endpoint!: string;
                let opts!: object;

                if (entity == 'POLYANET') {
                    endpoint = '/polyanets'; 
                    process.stdout.write('🪐 ');
                }

                if (entity.slice(-5) == 'SOLOON') {
                    endpoint = '/soloons';
                    
                    switch(entity[0]) {
                        case 'B': {
                            opts = { color: 'blue' };
                            break;
                        }
                        case 'R': {
                            opts = { color: 'red' };
                            break;
                        }
                        case 'P': {
                            opts = { color: 'purple' };
                            break;
                        } 
                        case 'W': {
                            opts = { color: 'white' };
                            break;
                        }
                    }

                    process.stdout.write('🌕 ');
                }

                if (entity.slice(-5) == 'COMETH') {
                    endpoint = '/comeths';

                    switch(entity[0]) {
                        case 'U': {
                            opts = { direction: 'up' };
                            break;
                        }
                        case 'D': {
                            opts = { direction: 'down' };
                            break;
                        }
                        case 'L': {
                            opts = { direction: 'left' };
                            break;
                        }
                        case 'R': {
                            opts = { direction: 'right' };
                            break;
                        }
                    }

                    process.stdout.write('☄️ ');
                }

                if (entity == 'SPACE') {
                    process.stdout.write('🌌 ');                
                };

                // post(endpoint, columnNumber, rowNumber, opts);

                // We draw the Goal map as it is parsed for visual confirmation
                // in the running process' Command Line Interface, using 
                // `process.stdout.write` in place of `console.log` so that we
                // can easily format the output to mimic the drawing of a map
                // as is presented by Crossmint's Megaverse service (can be
                // found at `https://challenge.crossmint.com/challenge`
                /*
                switch (entity) {
                    case 'SPACE': {
                        process.stdout.write('🌌 ');                   
                        break; 
                    }

                    case 'POLYANET': {
                        process.stdout.write('🪐 ');
                        post('/polyanets', rowNumber, columnNumber);
                        break;
                    }

                    case 'BLUE_SOLOON': {
                        process.stdout.write('🌕 ');
                        post('/soloons', rowNumber, columnNumber, { color: "blue" });
                        break;
                    }

                    case 'RED_SOLOON': {
                        process.stdout.write('🌕 ');
                        post('/soloons', rowNumber, columnNumber, { color: "red" });
                        break;
                    }

                    case 'PURPLE_SOLOON': {
                        process.stdout.write('🌕 ');
                        post('/soloons', rowNumber, columnNumber, { color: "purple" });
                        break;
                    }

                    case 'WHITE_SOLOON': {
                        post('/soloons', rowNumber, columnNumber, { color: "white" });
                        process.stdout.write('🌕 ');
                        break;
                    }

                    case 'UP_COMETH': {
                        process.stdout.write('☄️ ');
                        post('/comeths', rowNumber, columnNumber, { direction: "up" });
                        break;
                    }

                    case 'DOWN_COMETH': {
                        process.stdout.write('☄️ ');
                        post('/comeths', rowNumber, columnNumber, { direction: "down" });
                        break;
                    }

                    case 'LEFT_COMETH': {
                        process.stdout.write('☄️ ');
                        post('/comeths', rowNumber, columnNumber, { direction: "left" });
                        break;
                    }

                    case 'RIGHT_COMETH': {
                        process.stdout.write('☄️');
                        post('/comeths', rowNumber, columnNumber, { direction: "right" });
                        break;
                    }
                }
                */

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


function post(
    endpoint: string, 
    rowNumber: number, 
    columnNumber: number,
    opts?: object,
) {

    let data = JSON.stringify({
        row: rowNumber,
        column: columnNumber, 
        candidateId: process.env.CANDIDATE_ID,
        ...opts
    });

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        }
    };

    let req = https.request(API + endpoint, options, (res) => {
        console.log(res.statusCode);
        if (res.statusCode == 429) {
            post(endpoint, rowNumber, columnNumber, opts);
        }
    });

    req.on('error', (e) => {
        console.error('`POST` request error: ', e.message);
    });

    req.write(data);
    req.end();

};

