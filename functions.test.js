const scriptFunctions = require('./functions');

test('Check File exports', () => {
  expect(scriptFunctions.parse).toBeTruthy();
  expect(scriptFunctions.getPoints).toBeTruthy();
  expect(scriptFunctions.getFinalData).toBeTruthy();
  console.log('Todo chido!');
})

describe('Check Parse Functionality', () => {
  test('Parse should open a CSV file, load it and return the data in an array of objects', async () => {
    const parsedData = await scriptFunctions.parse('testData.csv');
    expect(Array.isArray(parsedData)).toBe(true);
    expect(parsedData.length).toBe(4159);
  })
});

describe('Check getPoints Functionality', () => {
  test('Get Points should divide the entries into municipalities and add points', async () => {
    const mockData = await scriptFunctions.parse('testData.csv');
    const testData = scriptFunctions.getPoints(mockData);
    expect(Array.isArray(testData)).toBe(false);
    expect(testData['23005']).toHaveProperty('entityCode', '23');
    expect(testData['23005']).toHaveProperty('entityName', 'Quintana Roo');
    expect(testData['23005']).toHaveProperty('municipalityCode', '005');
    expect(testData['23005']).toHaveProperty('municipalityName', 'Benito Juárez');
    expect(testData['23005']).toHaveProperty('points');
    expect(Array.isArray(testData['23005'].points)).toBeTruthy();
    expect(testData['23005'].points.length).toBe(324);
  })
})

describe('Check getFinalData Functionality', () => {
  test('Get Final Data should return the municipalities array with the average coords and max population coords', async () => {
    const expected = {
      entityCode: '23',
      entityName: 'Quintana Roo',
      municipalityCode: '005',
      municipalityName: 'Benito Juárez',
      avgLat: expect.any(Number),
      avgLon: expect.any(Number),
      popCenterLat: 21.161416,
      popCenterLon: -86.824811,
      population: 661176
    }
    const mockData = await scriptFunctions.parse('testData.csv');
    const testData = scriptFunctions.getPoints(mockData);
    const finalTestData = await scriptFunctions.getFinalData(testData);
    expect(Array.isArray(finalTestData)).toBe(true);
    expect(finalTestData).toEqual(expect.arrayContaining([expected]));
    const municipality = finalTestData.filter(it => it.entityCode === '23' && it.municipalityCode === '005')[0];
    expect(municipality.avgLat).toBeCloseTo(21.09374238);
    expect(municipality.avgLon).toBeCloseTo(-86.99374595);
  })
})