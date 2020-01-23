import { describe, it } from "mocha";
import { expect } from 'chai';
import { Observation, CurrentConditionsResponse, QualityControlStatus } from '../../../src/models/wunderground';
import { WeatherObserved } from "../../../src/models/weather";
import { Point } from "../../../src/models/point";

const exemplaryObservation = JSON.parse('{"stationID":"IHERNE113","obsTimeUtc":"2020-01-14T12:46:10Z","obsTimeLocal":"2020-01-14 13:46:10","neighborhood":"Herne","softwareType":"EasyWeatherV1.4.3","country":"DE","solarRadiation":58.1,"lon":7.20648146,"realtimeFrequency":null,"epoch":1579005970,"lat":51.54059601,"uv":0.0,"winddir":231,"humidity":86,"qcStatus":1,"metric":{"temp":9,"heatIndex":9,"dewpt":7,"windChill":6,"windSpeed":22,"windGust":31,"pressure":1004.44,"precipRate":0.00,"precipTotal":0.51,"elev":58}}');

describe('Observation model', () => {
    it('should create', () => {
        expect(new Observation()).to.be.instanceOf(Observation);
    });

    it('should be adapted correctly from raw response', () => {
        let obs = Observation.adapt(exemplaryObservation);
        // Properties where the value is taken directly from the response (without additional unit conversion)
        expect(obs.stationID).to.equal("IHERNE113");
        expect(obs.latitude).to.equal(51.54059601);
        expect(obs.longitude).to.equal(7.20648146);
        expect(obs.elevation).to.equal(58);
        expect(obs.neighborhood).to.equal("Herne");
        expect(obs.country).to.equal("DE");
        expect(obs.softwareType).to.equal("EasyWeatherV1.4.3");
        expect(obs.qcStatus).to.equal(QualityControlStatus.Passed);
        expect(obs.realtimeFrequency).to.be.null;
        expect(obs.solarRadiation).to.equal(58.1);
        expect(obs.uv).to.equal(0);
        expect(obs.windDirection).to.equal(231);
        expect(obs.temperature).to.equal(9);
        expect(obs.heatIndex).to.equal(9);
        expect(obs.dewPoint).to.equal(7);
        expect(obs.windChill).to.equal(6);
        expect(obs.pressure).to.equal(1004.44);

        // Properties where the value has been converted from another unit
        expect(obs.humidity).to.equal(0.86);
        expect(obs.windSpeed).to.be.closeTo(6.111111111111111, 0.000000000000001);
        expect(obs.windGust).to.be.closeTo(8.611111111111111, 0.000000000000001);
        expect(obs.precipitationRate).to.equal(0);
        expect(obs.precipitationTotal).to.equal(0.51);

        // Properties that were converted from one data type to another
        expect(obs.observationTime).to.be.not.null;
        expect((obs.observationTime as Date).getTime()).to.equal(new Date('2020-01-14T12:46:10Z').getTime());
    });

    it('should map to a valid WeatherObserved model', () => {
        let obs = Observation.adapt(exemplaryObservation);
        let weather = obs.toWeatherObserved();
        expect(weather).to.be.instanceOf(WeatherObserved);
        expect(weather.id).to.equal('urn:ngsi-ld:WeatherObserved:IHERNE113');
        expect(weather.dateObserved).to.equal(obs.observationTime);
        expect(weather.location).to.deep.equal(new Point(obs.latitude || 0, obs.longitude || 0, obs.elevation || 0));
        expect(weather.temperature).to.equal(obs.temperature);
        expect(weather.relativeHumidity).to.equal(obs.humidity);
        expect(weather.precipitation).to.equal(obs.precipitationRate);
        expect(weather.windDirection).to.equal(obs.windDirection);
        expect(weather.windSpeed).to.equal(obs.windSpeed);
        expect(weather.atmosphericPressure).to.equal(obs.pressure);
        expect(weather.solarRadiation).to.equal(obs.solarRadiation);
    });
});

describe('CurrentConditionsResponse model', () => {
    it('should create', () => {
        expect(new CurrentConditionsResponse()).to.be.instanceOf(CurrentConditionsResponse);
    });

    it('should be adapted correctly from raw response', () => {
        let res = CurrentConditionsResponse.adapt({ observations: [ exemplaryObservation ] });
        expect(res.observations.length).to.equal(1);
        expect(res.observations[0]).to.be.instanceOf(Observation);
    });
});
