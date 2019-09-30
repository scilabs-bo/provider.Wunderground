// Ignore types on weather-underground-node as no type definition exists
// @ts-ignore
import WeatherUndergroundNode from 'weather-underground-node';
import Debug from 'debug';
import config from './config';
import { Observation, CurrentConditionsResponse, QualityControlStatus } from './models/wunderground';
import { CurrentConditionsCache } from './cache';

// Setup debug for logging and weather underground node
const debug = Debug('provider:wunderground');
var wunderground = new WeatherUndergroundNode(config.get('key'));

var cache = new CurrentConditionsCache();

// Currently only current conditions endpoint is implemented
export async function getCurrentConditions(stationId : string) : Promise<Observation> {
    return new Promise((resolve, reject) => {
        // Try to get from cache (if enabled)
        if(config.get("cache.enabled")) {
            let observation = cache.get(stationId);
            if(observation !== null)
                return resolve(observation);
        }

        debug("Requesting current conditions for station id '%s' from weather underground API", stationId);
        wunderground.PWSCurrentContitions(stationId).request(function (err : any, response : any) {
            if(err)
                return reject(err);
            let adaptedResponse = CurrentConditionsResponse.adapt(response);
            // Update cache (if enabled)
            if(config.get("cache.enabled"))
                cache.update(adaptedResponse.observations[0]);
            // Warn, if quality control did not passed
            if(adaptedResponse.observations[0].qcStatus !== QualityControlStatus.Passed)
                debug("The observation from station %s might be incorrect, quality control reported non-passing status %d", 
                    stationId, adaptedResponse.observations[0].qcStatus);
            resolve(adaptedResponse.observations[0]);
        })
    });
}