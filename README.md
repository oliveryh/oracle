# Oracle

## About

Oracle was an experiment to create a platform that could take data ingested into a database and display it in with various visualisations easily. It was also an opportunity to learn Svelte.

The backend is served using postgraphile which creates a generic CRUD GraphQL API from a Postgres Schema. This makes the backend very ligthweight.

## Screenshots

![Heatmap](/assets/screenshot_heatmap.png?raw=true "Heatmap")
![Line Chart](/assets/screenshot_line.png?raw=true "Line Chart")

## Installation

1. Run `npm install` in both the `client` and `server` directories
2. Run `cd client && npm run start` to bring up the frontend
3. Run `cd server && npm run start` to bring up the backend

You'll have to create a `.env` file in `server` that contains the secrets you'll need to connect to postgres and connect to the Halo API

```
DB_URL=postgres://<user>:<pass>@localhost:5432/oracle
SERVER_PORT=3000
SERVER_SECRET=<secret>
AUTO_CODE_TOKEN=<token>
```
