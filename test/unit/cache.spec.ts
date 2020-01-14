// We need to set any 32 character hex string as api key to pass the verify call in config
// This hex string is randomly generated and does not work on the wunderground api
process.env['PROVIDER_WUNDERGROUND_API_KEY'] = '570335548314bdb25ed8e654bf9afc8c';

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { CurrentConditionsCache } from '../../src/cache';
import config from '../../src/config';
import { Observation } from '../../src/models/wunderground';

describe('CurrentConditionsCache', () => {
    it('should create', () => {
        expect(new CurrentConditionsCache()).to.be.instanceOf(CurrentConditionsCache);
    });

    it('should store an observation', () => {
        let ccc = new CurrentConditionsCache();
        let obs = new Observation();
        obs.stationID = 'IHERNE113';
        ccc.update(obs);
        expect(ccc.get('IHERNE113')).to.equal(obs);
    });

    it('should invalidate cache entries', () => {
        // Reduce the cache expire time to invalidate the entry right away
        config.set('cache.expireTime', 0);
        let ccc = new CurrentConditionsCache();
        let obs = new Observation();
        obs.stationID = 'IHERNE113';
        ccc.update(obs);
        expect(ccc.get('IHERNE113')).to.be.null;
    });
});
