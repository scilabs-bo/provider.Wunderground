import Debug from 'debug';
import config from './config';
import { Observation, CurrentConditionsResponse, QualityControlStatus } from './models/wunderground';
import { CurrentConditionsCache } from './cache';
import { URL } from 'url';
import { get } from 'https';
import { WundergroundAPIError } from './exceptions';

// Setup debug for logging
const debug = Debug('provider:wunderground');

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
        let endpointUrl = constructEndpointUrl(stationId);
        get(endpointUrl, (res) => {
            if(res.statusCode !== 200) {
                let error = new WundergroundAPIError(`Request to wunderground api failed with status code ${res.statusCode}`);
                return reject(error);
            }
            else if (!/^application\/json/.test(res.headers['content-type'] || "")) {
                let error = new WundergroundAPIError(`The returned request does not contain json according to the content-type header: ${res.headers['content-type']}`);
                return reject(error);
            }
            // Response looks fine, receive response
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                let adaptedResponse = CurrentConditionsResponse.adapt(JSON.parse(rawData));
                // Update cache (if enabled)
                if(config.get("cache.enabled"))
                cache.update(adaptedResponse.observations[0]);
                // Warn, if quality control did not passed
                if(adaptedResponse.observations[0].qcStatus !== QualityControlStatus.Passed)
                debug("The observation from station %s might be incorrect, quality control reported non-passing status %d", 
                    stationId, adaptedResponse.observations[0].qcStatus);
                resolve(adaptedResponse.observations[0]);
            }).on('error', (e) => { reject(e); });
        });
    });
}

function constructEndpointUrl(stationId : string) : URL {
    let url = new URL("https://api.weather.com/v2/pws/observations/current");
    url.searchParams.append("stationId", stationId);
    url.searchParams.append("format", "json");
    url.searchParams.append("units", "m") // Metric units
    url.searchParams.append("apiKey", config.get("key"));
    return url;
}