const Path = require('path');
const csv = require('csvtojson');

async function parse(file) {
  return csv().fromFile(Path.resolve(__dirname, 'data', 'source', file));
};

function getPoints(entries) {
  if (!Array.isArray(entries)) {
    console.error('Expected argument "entries" to be \'Array\'');
  }

  const result = entries.reduce((acc, it) => {
    const compoundKey = it.Cve_Ent + it.Cve_Mun;

    const point = {
      lat: parseFloat(it.Lat_Decimal),
      lon: parseFloat(it.Lon_Decimal),
      population: parseInt(it.Pob_Total)
    };

    if (!acc[compoundKey]) {
      acc[compoundKey] = {
        entityCode: it.Cve_Ent,
        entityName: it.Nom_Ent,
        municipalityCode: it.Cve_Mun,
        municipalityName: it.Nom_Mun,
        points: []
      }
    }

    acc[compoundKey].points.push(point);

    return acc;
  }, {});

  return result;
}

function getFinalData(municipalities) {
  const jsonData = Object.entries(municipalities).map(m => {
    const entry = m[1];
    const { entityCode, entityName, municipalityCode, municipalityName, points } = entry;

    const sum = points.reduce((acc, curr) => ({ lat: acc.lat + curr.lat, lon: acc.lon + curr.lon }));

    const maxPop = points.reduce((acc, it) => {
      if (isNaN(it.population)) it.population = 0;

      if (it.population > acc.population) {
        acc = { ...it };
      }

      return acc;
    }, { lat: 0, lon: 0, population: -1 });
    // const populations = entry.points.map(l => isNaN(l.population) ? 0 : l.population);
    // const popCenterIndex = populations.indexOf(Math.max(...populations));

    return {
      entityCode,
      entityName,
      municipalityCode,
      municipalityName,
      avgLat: sum.lat / points.length,
      avgLon: sum.lon / points.length,
      popCenterLat: maxPop.lat,
      popCenterLon: maxPop.lon
    }
  });

  return jsonData;
}

module.exports = { parse, getFinalData, getPoints };
