<script>
import { onMount } from "svelte";
import { apiData, apiDataCounts, seriesMA, seriesKills, seriesCounts } from './store.js';

async function getPage(page) {
  let response = await fetch('https://halo.api.stdlib.com/infinite@0.2.3/stats/matches/list/', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer tok_dev_FG8e8YuY4BpasZ51CbmSCWtiQj8KjHQkAoDukdN1ozgvreuQ4gUBRgc1ddmgQCWd',
        'Content-Type': 'application/json',
        'Cryptum-API-Version': '2.3-alpha'
    },
    body: JSON.stringify({
      gamertag: `IgnitedNinja`,
      limit: {
        'count': 25,
        'offset': 25 * page,
      },
      mode: 'matchmade',
      extended: false
    })
  })
  let data = await response.json()
  return data
}

async function getPages(startPage, endPage) {
  let currentPage = startPage
  let finalArr = []
  while(currentPage <= endPage) {
    const pageData = await getPage(currentPage)
    finalArr.push(...pageData.data)
    currentPage++
  }
  return finalArr
}


import { ApolloClient } from "@apollo/client";
import { setClient } from "svelte-apollo";

import { InMemoryCache } from 'apollo-cache-inmemory'
const cache = new InMemoryCache()

const httpEndpoint = 'http://localhost:3000/graphql';

const AUTH_TOKEN = 'apollo-token';

const client = new ApolloClient({
  uri: httpEndpoint,
  tokenName: AUTH_TOKEN,
  cache,
});

setClient(client);

import { gql } from 'graphql-tag'
import { query } from 'svelte-apollo';

const matches = query(gql`
  query MyQuery($playlist: String){
    haloMatches(
      orderBy: PLAYED_AT_ASC,
      filter: {
        playlist: {
          equalTo: $playlist
        }
      }
    ) {
      id,
      kills,
      deaths,
      playedAt,
    }
  }
`, {
  variables: {
    playlist: selectedPlaylist
  }
})

matches.subscribe(data => {
  apiData.set(data.data?.haloMatches)
})

$: matches.refetch({ playlist: selectedPlaylist });

let playlistOptionsGenerated = []

const generatePlaylist = async () => {
  const reply = await query(gql`
    query MyQuery {
      haloMatchesConnection {
        groupedAggregates(groupBy: PLAYLIST) {
          keys
          distinctCount {
            id
          }
        }
      }
    }
  `);
  reply.subscribe(data => {
    playlistOptionsGenerated = data.data?.haloMatchesConnection.groupedAggregates
      .map((el, idx) => {
        return {
          id: idx,
          text: el.keys[0],
          count: el.distinctCount.id
        }
      }) || []
  })
}
generatePlaylist()


const countMatches = async () => {
  const reply = await query(gql`
    query {
      haloMatchesConnection {
        groupedAggregates(groupBy: PLAYED_AT_TRUNCATED_TO_DAY) {
          keys
          distinctCount {
            id
          }
        }
      }
    }
  `);
  reply.subscribe(data => {
    apiDataCounts.set(data.data?.haloMatchesConnection.groupedAggregates)
  })
}
countMatches()

onMount(async () => {
  console.log("RUNNING")
});

import { Grid, Row, Column } from "carbon-components-svelte";
import "carbon-components-svelte/css/g100.css";

import "@carbon/charts/styles-g100.css";
import { LineChart } from "@carbon/charts-svelte";

import Console from "carbon-pictograms-svelte/lib/Console.svelte";

import { Chart } from 'svelte-echarts'
import * as echarts from 'echarts'

$: options = {
  title: {
    top: 30,
    left: 'center',
    text: 'Game Count'
  },
  
  tooltip: {},
  visualMap: {
    min: 0,
    max: 20,
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    top: 65,
    inRange: {   
      color: ['#8a3ffc', '#d4bbff'] //From smaller to bigger value ->
    }
  },
  calendar: {
    dayLabel: {
      firstDay: 1,
      nameMap: 'cn'
    },
    top: 120,
    left: 30,
    right: 30,
    cellSize: ['auto', 13],
    range: '2021',
    splitLine: {
      lineStyle: {
          color: 'white',
          width: 1
      }
    },
    itemStyle: {
      borderWidth: 0.5,
    },
    yearLabel: { show: true }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: $seriesCounts
  },
  backgroundColor: 'transparent'
};

const theme = 'dark'

const playlistOptions = [{ id: '0', text: 'Quick Play' }, { id: '1', text: 'Big Team Battle' }]

import { Dropdown } from "carbon-components-svelte";

let selectedFieldIdx = 0;
$: selectedPlaylist = playlistOptionsGenerated[selectedFieldIdx]?.text || ""
$: console.log(playlistOptionsGenerated)

</script>

<main>
  <Grid>
    <Row style="padding-top: 20px">
      <Column>
        <Row>
          <Console fille="blue" style="transform: scale(70%)translateY(-10px);"/>
          <h1>Halo Infinite</h1>
        </Row>
        <Row style="height: 300px">
          <Chart {theme} {options} />
        </Row>
        <Row>
          <Column>
            {#if playlistOptionsGenerated}
              <Dropdown
                titleText="Playlist"
                bind:selectedIndex={selectedFieldIdx}
                items={playlistOptionsGenerated}
              />
            {/if}
            <LineChart
            data={$seriesMA}
            options={{
              "title": "K/D Ratio Moving Average",
              "axes": {
                "bottom": {
                  "title": "Game Number",
                  "mapsTo": "key",
                  "scaleType": "labels"
                },
                "left": {
                  "domain": [0.5,2],
                  "mapsTo": "value",
                  "title": "Conversion rate",
                  "scaleType": "linear"
                }
              },
              "height": "400px",
              "data": {
                "loading": $seriesMA.length == 0
              },
            }}
          />
          </Column>
        </Row>
      <LineChart
    data={$seriesKills}
    options={{
      "title": "Kills/Deaths",
      "axes": {
        "bottom": {
          "title": "Game Number",
          "mapsTo": "key",
			    "scaleType": "labels"
        },
        "left": {
          "mapsTo": "value",
          "title": "Conversion rate",
          "scaleType": "linear"
        }
      },
      "curve": "curveMonotoneX",
      "height": "400px",
      "data": {
        "loading": $seriesKills.length == 0
      },
    }}
  />
      </Column>
    </Row>
  </Grid>
</main>

<style>

</style>

