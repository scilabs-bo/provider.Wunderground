// We need to set any 32 character hex string as api key to pass the verify call in config
// This hex string is randomly generated and does not work on the wunderground api
process.env['PROVIDER_WUNDERGROUND_API_KEY'] =
    '570335548314bdb25ed8e654bf9afc8c';

import { describe, it, beforeEach, before, afterEach, after } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import express from 'express';
import wundergroundContextProvider from '../../src/wundergroundContextProvider';
import nock from 'nock';
import { Server } from 'http';

// A real response from the wunderground api
const testResponse =
    '{"observations":[{"stationID":"IHERNE113","obsTimeUtc":"2020-01-14T12:46:10Z","obsTimeLocal":"2020-01-14 13:46:10","neighborhood":"Herne","softwareType":"EasyWeatherV1.4.3","country":"DE","solarRadiation":58.1,"lon":7.20648146,"realtimeFrequency":null,"epoch":1579005970,"lat":51.54059601,"uv":0.0,"winddir":231,"humidity":86,"qcStatus":1,"metric":{"temp":9,"heatIndex":9,"dewpt":7,"windChill":6,"windSpeed":22,"windGust":31,"pressure":1004.44,"precipRate":0.00,"precipTotal":0.51,"elev":58}}]}';
// A response with an invalid wind direction (-1)
const invalidValueResponse =
    '{"observations":[{"stationID":"IHERNE113","obsTimeUtc":"2020-01-14T12:46:10Z","obsTimeLocal":"2020-01-14 13:46:10","neighborhood":"Herne","softwareType":"EasyWeatherV1.4.3","country":"DE","solarRadiation":58.1,"lon":7.20648146,"realtimeFrequency":null,"epoch":1579005970,"lat":51.54059601,"uv":0.0,"winddir":-1,"humidity":86,"qcStatus":1,"metric":{"temp":9,"heatIndex":9,"dewpt":7,"windChill":6,"windSpeed":22,"windGust":31,"pressure":1004.44,"precipRate":0.00,"precipTotal":0.51,"elev":58}}]}';

// Setup chai to test http responses
chai.use(chaiHttp);
const expect = chai.expect;

describe('Wunderground context provider', () => {
    let app: express.Express;
    let server: Server;

    before(() => {
        // Start the provider on port 3000 for further testing
        app = express();
        app.use('/v2', wundergroundContextProvider);
        return new Promise((resolve) => (server = app.listen(3000, resolve)));
    });
    after(() => {
        // Shut down the provider gracefully
        server.close();
    });

    beforeEach(() => {
        nock('https://api.weather.com')
            .get(/^\/v2\/pws\/observations\/current.*stationId=IHERNE113.*$/)
            .reply(200, testResponse, { 'Content-Type': 'application/json' });
        nock('https://api.weather.com')
            .get(() => true)
            .reply(404)
            .persist();
    });
    afterEach(nock.cleanAll);

    it('should respond to a request', async () => {
        let res = await chai.request(app).post('/v2/op/query').send({
            entities: [],
        });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.instanceOf(Array);
    });

    it('should respond with the correct station data', async () => {
        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE113',
                    },
                ],
            });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.instanceOf(Array).with.lengthOf(1);
        expect(res.body[0]).to.have.all.keys([
            'id',
            'type',
            'dataProvider',
            'location',
            'dateObserved',
            'dewPoint',
            'temperature',
            'relativeHumidity',
            'precipitation',
            'windDirection',
            'windSpeed',
            'atmosphericPressure',
            'solarRadiation',
        ]);
    });

    it('should only respond with requested attributes', async () => {
        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE113',
                    },
                ],
                attrs: ['windDirection', 'atmosphericPressure'],
            });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.instanceOf(Array).with.lengthOf(1);
        expect(res.body[0]).to.have.all.keys([
            'id',
            'type',
            'windDirection',
            'atmosphericPressure',
        ]);
    });

    it('should ignore unknown requested attributes', async () => {
        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE113',
                    },
                ],
                attrs: [
                    'windDirection',
                    'atmosphericPressure',
                    'someUnknownAttribute',
                ],
            });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.instanceOf(Array).with.lengthOf(1);
        expect(res.body[0]).to.have.all.keys([
            'id',
            'type',
            'windDirection',
            'atmosphericPressure',
        ]);
    });

    it('should return NotFound on non existent station id', async () => {
        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE114',
                    },
                ],
            });
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.have.any.keys(['error']);
        expect(res.body.error).to.equal('NotFound');
    });

    it('should return ValueError on invalid API data', async () => {
        // We need to prepare a special response for this test
        nock.cleanAll();
        nock('https://api.weather.com')
            .get(/^\/v2\/pws\/observations\/current.*stationId=IHERNE113.*$/)
            .reply(200, invalidValueResponse, {
                'Content-Type': 'application/json',
            });
        // Still make sure that we do not access the real api by accident
        nock('https://api.weather.com')
            .get(() => true)
            .reply(404)
            .persist();

        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE113',
                    },
                ],
            });
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res.body).to.have.any.keys(['error']);
        expect(res.body.error).to.equal('ValueError');
    });

    it('should return APIError on invalid API response', async () => {
        // Once again we will need to prepare a special response for this test (omit the Content-Type header this time)
        nock.cleanAll();
        nock('https://api.weather.com')
            .get(/^\/v2\/pws\/observations\/current.*stationId=IHERNE113.*$/)
            .reply(200, testResponse);
        // Still make sure that we do not access the real api by accident
        nock('https://api.weather.com')
            .get(() => true)
            .reply(404)
            .persist();

        let res = await chai
            .request(app)
            .post('/v2/op/query')
            .send({
                entities: [
                    {
                        type: 'WeatherObserved',
                        id: 'urn:ngsi-ld:WeatherObserved:IHERNE113',
                    },
                ],
            });
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res.body).to.have.any.keys(['error']);
        expect(res.body.error).to.equal('APIError');
    });
});
