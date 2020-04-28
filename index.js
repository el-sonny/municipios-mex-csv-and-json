const fs = require('fs').promises;
const json2csv = require('json-2-csv');

async function execute(filename) {
  const entries = await parse(filename);

  const municipalities = getPoints(entries);

  const json = getFinalData(municipalities);

  const csv = await json2csv.json2csvAsync(json);

  await fs.writeFile('./data/municipios.json', JSON.stringify(json));
  await fs.writeFile('./data/municipios.csv', csv);
};

if (process.argv.length !== 3) {
  console.error('Expected one filename argument');
}
execute(process.argv[2]);
