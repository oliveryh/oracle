const fetch = require('node-fetch');
const { Client } = require('pg');
require('dotenv').config();
const config = require('../../config.js');
var _ = require('lodash');
var connectionString = config.db.url;
const { sql, createPool } = require('slonik');

const pool = createPool(connectionString);

async function getPage(gamertag, page) {
  let response = await fetch(
    'https://halo.api.stdlib.com/infinite@0.2.3/stats/matches/list/',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.modules.halo.token}`,
        'Content-Type': 'application/json',
        'Cryptum-API-Version': '2.3-alpha',
      },
      body: JSON.stringify({
        gamertag,
        limit: {
          count: 25,
          offset: 25 * page,
        },
        mode: 'matchmade',
        extended: false,
      }),
    }
  );
  let data = await response.json();
  return data;
}

async function getPages(gamertag, startPage, endPage) {
  let currentPage = startPage;
  let finalArr = [];
  while (currentPage <= endPage) {
    const pageData = await getPage(gamertag, currentPage);
    finalArr.push(...pageData.data);
    currentPage++;
  }
  return finalArr;
}

async function ingestData(gamertag) {
  const data = await getPages(gamertag, 0, 10);
  const reformattedData = data.map((apiResult) => {
    return [
      apiResult.id,
      gamertag,
      _.get(apiResult, 'details.map.name'),
      _.get(apiResult, 'details.playlist.name'),
      _.get(apiResult, 'player.stats.core.summary.kills'),
      _.get(apiResult, 'player.stats.core.summary.deaths'),
      apiResult.played_at,
    ];
  });

  pool.connect(async (connection) => {
    await connection.query(
      sql`
    INSERT INTO app_public.halo_matches (id, gamertag, map, playlist, kills, deaths, played_at)
    SELECT *
    FROM ${sql.unnest(reformattedData, [
      'text',
      'text',
      'text',
      'text',
      'int4',
      'int4',
      'timestamptz',
    ])}
  `
    );
  });
}

ingestData('IgnitedNinja');
