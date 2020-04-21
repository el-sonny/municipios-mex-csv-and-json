const fs = require('fs').promises;
const Path = require('path');
const csv = require('csvtojson');
const json2csv = require('json-2-csv');

async function parse(file) {
    return csv().fromFile(Path.resolve(__dirname, 'data', 'source', file));
};

async function execute() {
    const entries = await parse('AGEEML_2020421937346.csv');
    let municipalities = {};
    entries.forEach(entry => {
        const compoundKey = entry.Cve_Ent + entry.Cve_Mun;
        if (!municipalities[compoundKey]) {
            municipalities[compoundKey] = {
                entityCode: entry.Cve_Ent,
                entityName: entry.Nom_Ent,
                municipalityCode: entry.Cve_Mun,
                municipalityName: entry.Nom_Mun,
                points: [{
                    lat: parseFloat(entry.Lat_Decimal),
                    lon: parseFloat(entry.Lon_Decimal),
                    population: parseInt(entry.Pob_Total)
                }]
            }
        } else {
            municipalities[compoundKey].points.push({
                lat: parseFloat(entry.Lat_Decimal),
                lon: parseFloat(entry.Lon_Decimal),
                population: parseInt(entry.Pob_Total)
            })
        }
    });

    const json = Object.entries(municipalities).map(m => {
        const entry = m[1];
        const sum = entry.points.reduce((acc, curr) => ({ lat: acc.lat + curr.lat, lon: acc.lon + curr.lon }));
        const populations = entry.points.map(l => isNaN(l.population) ? 0 : l.population);
        const popCenterIndex = populations.indexOf(Math.max(...populations));
        return {
            entityCode: entry.entityCode,
            entityName: entry.entityName,
            municipalityCode: entry.municipalityCode,
            municipalityName: entry.municipalityName,
            avgLat: sum.lat / entry.points.length,
            avgLon: sum.lon / entry.points.length,
            popCenterLat: entry.points[popCenterIndex].lat,
            popCenterLon: entry.points[popCenterIndex].lon
        }
    });

    const csv = await json2csv.json2csvAsync(json);

    await fs.writeFile('./data/municipios.json', JSON.stringify(json));
    await fs.writeFile('./data/municipios.csv', csv);
}

execute();