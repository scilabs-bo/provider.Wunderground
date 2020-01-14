import { describe, it } from 'mocha';
import { expect } from 'chai';
import { WeatherObserved, WeatherType, Visibility, Tendency } from './weather';
import { Point } from './point';

describe('WeatherObserved model', () => {

    it('should create', () => {
        expect(new WeatherObserved('', new Date(), '')).to.be.instanceOf(WeatherObserved);
    });

    it('should be created with a location when a Point is passed', () => {
        expect(new WeatherObserved('', new Date(), new Point(0, 0))).to.have.any.keys('_location');
    });

    it('should be created with an address when a string is passed', () => {
        expect(new WeatherObserved('', new Date(), '')).to.have.any.keys('_address');
    });

    it('should enforce a location when address is undefined', () => {
        expect(
            () => new WeatherObserved('', new Date(), new Point(0, 0)).location = undefined
        ).to.throw(Error, /address is undefined/);
    });

    it('should enforce an address when location is undefined', () => {
        expect(
            () => new WeatherObserved('', new Date(), '').address = undefined
        ).to.throw(Error, /location is undefined/);
    });

    it('should throw an error on invalid relative humidity', () => {
        let w = new WeatherObserved('', new Date(), '');
        expect(() => w.relativeHumidity = 0.5).to.not.throw();
        expect(() => w.relativeHumidity = -0.1).to.throw(Error, /must be a number between 0 and 1/);
        expect(() => w.relativeHumidity = 1.1).to.throw(Error, /must be a number between 0 and 1/);
    });

    it('should throw an error on invalid wind direction', () => {
        let w = new WeatherObserved('', new Date(), '');
        expect(() => w.windDirection = 180).to.not.throw();
        expect(() => w.windDirection = -1).to.throw(Error, /measured in decimal degrees/);
        expect(() => w.windDirection = 361).to.throw(Error, /measured in decimal degrees/);
    });

    it('should normalize correctly', () => {
        let date = new Date();
        let w = new WeatherObserved('someId', date, new Point(1, 2, 3));
        w.dataProvider = new URL('http://example.com');
        w.name = 'Some location has been observed here';
        w.source = 'Some source';
        w.refDevice = 'urn:ngsi-ld:Device:001';
        w.refPointOfInterest = 'urn:ngsi-ld:PointOfInterest:001';
        w.weatherType = [ WeatherType.Drizzle, WeatherType.HailShower ];
        w.dewPoint = 5;
        w.visibility = Visibility.Poor;
        w.temperature = 20;
        w.relativeHumidity = 0.5;
        w.precipitation = 50;
        w.windDirection = 350;
        w.windSpeed = 50;
        w.atmosphericPressure = 1013;
        w.pressureTendency = Tendency.Raising;
        w.solarRadiation = 5;
        w.illuminance = 500;
        w.streamGauge = 20;
        w.snowHeight = 20;

        expect(w.normalize()).to.deep.equal({
            id: 'someId',
            type: 'WeatherObserved',
            dataProvider: {
                type: 'URL',
                value: 'http://example.com/'
            },
            name: {
                type: 'Text',
                value: 'Some location has been observed here'
            },
            location: {
                type: 'geo:json',
                value: {
                    type: 'Point',
                    coordinates: [2, 1, 3]
                }
            },
            address: undefined,
            dateObserved: {
                type: 'DateTime',
                value: date.toISOString()
            },
            source: {
                type: 'Text',
                value: 'Some source'
            },
            refDevice: {
                type: 'Relationship',
                value: 'urn:ngsi-ld:Device:001'
            },
            refPointOfInterest: {
                type: 'Relationship',
                value: 'urn:ngsi-ld:PointOfInterest:001'
            },
            weatherType: {
                type: 'Text',
                value: 'drizzle,hailShower'
            },
            dewPoint: {
                type: 'Number',
                value: 5
            },
            visibility: {
                type: 'Text',
                value: 'poor'
            },
            temperature: {
                type: 'Number',
                value: 20
            },
            relativeHumidity: {
                type: 'Number',
                value: 0.5
            },
            precipitation: {
                type: 'Number',
                value: 50
            },
            windDirection: {
                type: 'Number',
                value: 350
            },
            windSpeed: {
                type: 'Number',
                value: 50
            },
            atmosphericPressure: {
                type: 'Number',
                value: 1013
            },
            pressureTendency: {
                type: 'Text',
                value: 'raising'
            },
            solarRadiation: {
                type: 'Number',
                value: 5
            },
            illuminance: {
                type: 'Number',
                value: 500
            },
            streamGauge: {
                type: 'Number',
                value: 20
            },
            snowHeight: {
                type: 'Number',
                value: 20
            }
        });
    });
});
