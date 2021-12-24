import { writable, derived } from 'svelte/store';
import _ from 'lodash';

export const apiData = writable([]);
export const apiDataCounts = writable([]);

export const seriesKills = derived(apiData, ($apiData) => {
  if (Array.isArray($apiData)) {
    return ['kills', 'deaths'].reduce((acc, curr) => {
      return acc.concat(
        $apiData.map((datum, idx) => {
          return {
            group: curr,
            key: idx,
            value: datum[curr],
          };
        })
      );
    }, []);
  }
  return [];
});

export const seriesCounts = derived(apiDataCounts, ($apiDataCounts) => {
  if (Array.isArray($apiDataCounts)) {
    return $apiDataCounts.map((el) => {
      return [el.keys[0].slice(0, 10), Number(el.distinctCount.id)];
    });
  }
  return [];
});

export const seriesMA = derived(apiData, ($apiData) => {
  function average(numbers) {
    const kills = numbers.reduce((acc, stat) => acc + stat.kills, 0);
    const deaths = numbers.reduce((acc, stat) => acc + stat.deaths, 0);
    return kills / deaths;
  }

  function window(_number, index, array) {
    const start = Math.max(0, index - 15);
    const end = Math.min(array.length, index + 1);
    return _.slice(array, start, end);
  }

  function moving_average(numbers) {
    return _.chain(numbers).map(window).map(average).value();
  }

  if (Array.isArray($apiData)) {
    return moving_average($apiData).map((stat, idx) => {
      return {
        group: 'Kill/Death Ratio (Moving Average)',
        key: idx,
        value: Math.round(stat * 1000) / 1000,
      };
    });
  }
  return [];
});
