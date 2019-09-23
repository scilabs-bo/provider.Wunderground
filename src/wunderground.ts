// Ignore types on weather-underground-node as no type definition exists
// @ts-ignore
import WeatherUndergroundNode from 'weather-underground-node';
import Debug from 'debug';
import config from './config';
import { Observation, CurrentConditionsResponse, QualityControlStatus } from './models/wunderground';

// Setup debug for logging and weather underground node
const debug = Debug('provider:wunderground');
var wunderground = new WeatherUndergroundNode(config.get('key'));

// Currently only current conditions endpoint is implemented
export async function getCurrentConditions(stationId : string) : Promise<Observation> {
    return new Promise((resolve, reject) => {
        debug("Requesting current conditions for station id '%s' from weather underground API", stationId);
        wunderground.PWSCurrentContitions(stationId).request(function (err : any, response : any) {
            if(err)
                return reject(err);
            let adaptedResponse = CurrentConditionsResponse.adapt(response);
            // Warn, if quality control did not passed
            if(adaptedResponse.observations[0].qcStatus !== QualityControlStatus.Passed)
                debug.log("The observation from station %s might be incorrect, quality control reported non-passing status %d", 
                    stationId, adaptedResponse.observations[0].qcStatus);
            resolve(adaptedResponse.observations[0]);
        })
    });
}