import express, { Response, Request } from 'express';
import Debug from 'debug';
import { getCurrentConditions } from './wunderground';
import { ProviderResponse } from './models/context';
import { ValueError, WundergroundAPIError } from './exceptions';

// Setup debug for logging and default router
const debug = Debug('provider:router');

async function handleContextRequest(req : Request, res : Response) {
    debug("Received a new request to the query endpoint to deliver %o", req.body.attrs || "everything");
    // TODO: Make sure body is NGSIv2 conforming
    let response = new ProviderResponse();
    for(let i = 0, entity = req.body.entities[0]; i < req.body.entities.length; i++, entity = req.body.entities[i]) {
        if(entity.type !== "WeatherObserved") {
            // This context provider only supports WeatherObserved type
            debug("Unable to serve context element of type '%s'. Only type 'WeatherObserved' is supported", entity.type);
            return res.status(400).end();
        }

        // Expected id format: urn:ngsi-ld:WeatherObserved:<Station ID>
        let stationId = entity.id.split(':')[3];
        try {
            let observation = await getCurrentConditions(stationId);
            let weatherObserved = observation.toWeatherObserved();
            response.entities.push(weatherObserved);
        }
        catch(e) {
            if(e instanceof ValueError) {
                // Value error thrown by models
                debug("Encountered value error while parsing api data for station id '%s'", stationId);
                debug("%O", e);
                return res.status(503).end();
            }
            else if(e instanceof WundergroundAPIError) {
                // API error
                debug("Encountered API error while processing query for station id '%s'", stationId);
                debug("%O", e);
                return res.status(503).end();
            }
            else if(e instanceof Error) {
                // Common error (Network?)
                debug("Encountered common error while processing query for station id '%s'", stationId);
                debug("%O", e);
                return res.status(503).end();
            }
            else {
                // Unknown error
                debug("Encountered unknown error while processing query for station id '%s'", stationId);
                debug("%O", e);
                return res.status(500).end();
            }
        }
    }

    // Send response back to context broker
    let preparedResponse = response.prepare(req.body.attrs);
    return res.json(preparedResponse);
}

var router = express.Router();
// Requests will contain NGSIv2 payloads in JSON format, therefore we need to parse the body using the express.json middleware
router.use(express.json());
router.post('/op/query', handleContextRequest);

export default router;
