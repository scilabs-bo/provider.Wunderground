import { WeatherObserved } from './weather';
import { Point } from './point';

export class CurrentConditionsResponse {
    public observations : Observation[] = [];

    static adapt(response : any) : CurrentConditionsResponse {
      return {
        observations: response.observations.map((obs : any) => Observation.adapt(obs)),
      };
    }
}

export class Observation {
    public stationID : string = '';

    public latitude : number | null = null;

    public longitude : number | null = null;

    public elevation : number | null = null;

    public neighborhood : string | null = null;

    public country : string | null = null;

    public softwareType : string | null = null;

    public qcStatus : QualityControlStatus = QualityControlStatus.Unknown;

    public observationTime : Date | null = null;

    public realtimeFrequency : number | null = null;

    public solarRadiation : number | null = null;

    public uv : number | null = null;

    public windDirection : number | null = null;

    public humidity : number | null = null;

    public temperature : number | null = null;

    public heatIndex : number | null = null;

    public dewPoint : number | null = null;

    public windChill : number | null = null;

    public windSpeed : number | null = null;

    public windGust : number | null = null;

    public pressure : number | null = null;

    public precipitationRate : number | null = null;

    public precipitationTotal : number | null = null;

    static adapt(rawObservation : any) : Observation {
      const observation = new Observation();
      observation.stationID = rawObservation.stationID;
      observation.latitude = rawObservation.lat;
      observation.longitude = rawObservation.lon;
      observation.elevation = rawObservation.metric.elev; // m
      observation.neighborhood = rawObservation.neighborhood;
      observation.country = rawObservation.country;
      observation.softwareType = rawObservation.softwareType;
      observation.qcStatus = rawObservation.qcStatus;
      observation.observationTime = new Date(rawObservation.obsTimeUtc); // obsTimeUtc is ISO formatted datetime
      observation.realtimeFrequency = rawObservation.realtimeFrequency;
      observation.solarRadiation = rawObservation.solarRadiation; // W / m²
      observation.uv = rawObservation.uv; // UV index
      observation.windDirection = rawObservation.winddir; // °
      observation.humidity = rawObservation.humidity / 100; // observation.humidity is between 0 and 100, take care of the percentage sign
      observation.temperature = rawObservation.metric.temp; // °C
      observation.heatIndex = rawObservation.metric.heatIndex; // °C
      observation.dewPoint = rawObservation.metric.dewpt; // °C
      observation.windChill = rawObservation.metric.windChill; // °C
      observation.windSpeed = rawObservation.metric.windSpeed * (5 / 18); // km/h converted to m/s (factor: 5/18)
      observation.windGust = rawObservation.metric.windGust * (5 / 18); // km/h converted to m/s (factor: 5/18)
      observation.pressure = rawObservation.metric.pressure; // mb converted to hPa (factor: 1)
      observation.precipitationRate = rawObservation.metric.precipRate; // mm converted to l / m² (factor: 1)
      observation.precipitationTotal = rawObservation.metric.precipTotal; // mm converted to l / m² (factor: 1)
      return observation;
    }

    toWeatherObserved() : WeatherObserved {
      const weatherObserved = new WeatherObserved(
        `urn:ngsi-ld:WeatherObserved:${this.stationID}`,
        this.observationTime || new Date(),
        new Point(this.latitude || 0, this.longitude || 0, this.elevation || 0),
      );
      weatherObserved.dataProvider = new URL('https://api.weather.com/v2/pws/observations/current');

      // Weather data
      weatherObserved.dewPoint = this.dewPoint !== null ? this.dewPoint : undefined;
      weatherObserved.temperature = this.temperature !== null ? this.temperature : undefined;
      weatherObserved.relativeHumidity = this.humidity !== null ? this.humidity : undefined;
      weatherObserved.precipitation = this.precipitationRate !== null ? this.precipitationRate : undefined;
      weatherObserved.windDirection = this.windDirection !== null ? this.windDirection : undefined;
      weatherObserved.windSpeed = this.windSpeed !== null ? this.windSpeed : undefined;
      weatherObserved.atmosphericPressure = this.pressure !== null ? this.pressure : undefined;
      weatherObserved.solarRadiation = this.solarRadiation !== null ? this.solarRadiation : undefined;

      return weatherObserved;
    }
}

export enum QualityControlStatus {
    Unknown = -1, PossiblyIncorrect = 0, Passed = 1
}
