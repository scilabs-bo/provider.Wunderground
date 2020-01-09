import Debug from 'debug';
import { Observation } from './models/wunderground';
import config from './config';

const debug = Debug('provider:cache');

export class CurrentConditionsCache {
    private cache : { [key : string] : CurrentConditionsCacheEntry } = {};

    get(stationId : string) : Observation | null {
      // Check if a cache entry is present
      if (this.cache[stationId]) {
        // Check if entry is still valid
        if (this.cache[stationId].expiryDate.getTime() - (new Date()).getTime() > 0) {
          debug("Serving current conditions for station id '%s' from cache", stationId);
          return this.cache[stationId].observation;
        }
        // Cache is not valid anymore, remove entry
        delete this.cache[stationId];
        debug("Cache entry for station id '%s' expired. Removed entry from cache", stationId);
      } else {
        debug("No cache entry for station id '%s' found", stationId);
      }
      return null;
    }

    update(observation : Observation) {
      this.cache[observation.stationID] = new CurrentConditionsCacheEntry(observation, config.get('cache.expireTime'));
      debug("Updated cache entry for station id '%s' successfully", observation.stationID);
    }
}

export class CurrentConditionsCacheEntry {
    expiryDate : Date;

    observation : Observation;

    constructor(observation : Observation, seconds : number) {
      this.observation = observation;
      this.expiryDate = new Date();
      this.expiryDate.setSeconds(this.expiryDate.getSeconds() + seconds);
    }
}
