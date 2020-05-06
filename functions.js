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
    const compoundKey = `${it.Cve_Ent}${it.Cve_Mun}`;

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

function getPopObj(popArr) {
  const res = popArr.reduce((acc, it) => {
    const {
      Cve_Ent: entityCode,
      Nom_Ent: entityName,
      Cve_Mun: municipalityCode,
      Nom_Mun: municipalityName,
      Pob_Total: populationStr,
    } = it;

    acc[`${entityCode}${municipalityCode}`] = {
      entityCode,
      entityName,
      municipalityCode,
      municipalityName,
      population: parseInt(populationStr)
    };

    return acc;
  }, {});

  return res;
}

async function getFinalData(municipalities) {
  const popDataArr = await parse('AGEEML_2020421930442.csv');
  const popDataObj = getPopObj(popDataArr);

  const jsonData = Object.entries(municipalities).map(m => {
    const [mun, entry] = m;
    const { entityCode, entityName, municipalityCode, municipalityName, points } = entry;

    const sum = points.reduce((acc, curr) => ({ lat: acc.lat + curr.lat, lon: acc.lon + curr.lon }));

    const maxPop = points.reduce((acc, it) => {
      if (isNaN(it.population)) it.population = 0;

      if (it.population > acc.population) {
        acc = { ...it };
      }

      return acc;
    }, { lat: 0, lon: 0, population: -1 });

    return {
      entityCode,
      entityName,
      municipalityCode,
      municipalityName,
      avgLat: sum.lat / points.length,
      avgLon: sum.lon / points.length,
      popCenterLat: maxPop.lat,
      popCenterLon: maxPop.lon,
      population: popDataObj[mun].population
    }
  });

  return jsonData;
}

module.exports = { parse, getFinalData, getPoints };
