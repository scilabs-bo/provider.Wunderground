import { describe, it } from 'mocha';
import { expect } from 'chai';
import nock from 'nock';
import { getCurrentConditions } from '../../src/wunderground';

const testResponse = '{"observations":[{"stationID":"IHERNE113","obsTimeUtc":"2020-01-14T12:46:10Z","obsTimeLocal":"2020-01-14 13:46:10","neighborhood":"Herne","softwareType":"EasyWeatherV1.4.3","country":"DE","solarRadiation":58.1,"lon":7.20648146,"realtimeFrequency":null,"epoch":1579005970,"lat":51.54059601,"uv":0.0,"winddir":231,"humidity":86,"qcStatus":1,"metric":{"temp":9,"heatIndex":9,"dewpt":7,"windChill":6,"windSpeed":22,"windGust":31,"pressure":1004.44,"precipRate":0.00,"precipTotal":0.51,"elev":58}}]}';

describe('Wunderground API client', () => {

    beforeEach(() => {
        nock('https://api.weather.com')
          .get(/^\/v2\/pws\/observations\/current.*/)
          .reply(200, testResponse, { 'Content-Type': 'application/json' });
    });
    afterEach(nock.cleanAll);

    it('should retrieve the current conditions', async () => {
        let obs = await getCurrentConditions('IHERNE113');
        expect(obs.stationID).to.equal('IHERNE113');
    });
});
