# megaverse
Mint a Megaverse with Crossmint's Megaverse service

Built for Crossmint's coding challenge, this repository uses the provided 
Megaverse creator API to build 2D spaces of various "astral objects" (emojis) by
making requests to Crossmint's Megaverse service.

## Breakdown
Initally, we are presented with three types of astral objects:
- POLYanets 🪐
- SOLoons 🌙
- comETHs ☄

We must create a 2D space ourselves by making requests to Crossmint's megaverse
service API.

### The API
Available at:
```
https://challenge.crossmint.io/api
```

With Crossmint's Megaverse service (a REST API), we can generate the different 
astral objects, given that we pass the required `cadidateId` parameter to the
service. This is provided to an interviewee via email.
```
https://challenge.crossmint.io/api?candidate_id={PROVIDED CANDIDATE ID}
```

### Polyanets
- `POST` /polyanets
    + Arguments: row, column


### The Challenge
Broken up into two phases

### Phase One
The first phase of the coding challenge has us looking to build


## Getting Started
### Prequisites
- `npm`
- `npx`
- `node`

### Installation
Clone this repository.
```
```

In the cloned repository, install megaverse via NPM.
```
```

### Testing
Copy `env`, rename it to `.env`, and add a candidate ID.
```
```

Start megaverse
```
npm start
```

