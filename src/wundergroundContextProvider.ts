import express, { Response, Request } from 'express';
import Debug from 'debug';
import { getCurrentConditions } from './wunderground';
import { ProviderResponse, ContextResponse } from './models/context';

// Setup debug for logging and default router
const debug = Debug('provider:router');

async function handleContextRequest(req : Request, res : Response) {
    debug("Received a new request to the queryContext endpoint to deliver %o", req.body.attributes);
    // TODO: Make sure body is NGSIv1 conforming
    let response = new ProviderResponse();
    for(let i = 0; i < req.body.entities.length; i++) {
        let contextResponse = new ContextResponse();
        // Mirror id, type and isPattern from entity
        contextResponse.contextElement.id = req.body.entities[i].id;
        contextResponse.contextElement.isPattern = req.body.entities[i].isPattern;
        contextResponse.contextElement.type = req.body.entities[i].type;
        // By default a context request will be successful
        contextResponse.statusCode = { code: "200", reasonPhrase: "OK" };

        // Expected id format: urn:ngsi-ld:WeatherObserved:<Station ID>
        let stationId = req.body.entities[i].id.split(':')[3];
        try {
            let observation = await getCurrentConditions(stationId);
            let normalizedWeatherObserved = observation.toWeatherObserved().normalize();
            for(let j = 0; j < req.body.attributes.length; j++) {
                if(normalizedWeatherObserved[req.body.attributes[j]] === undefined) {
                    // Attribute not defined
                    debug("Attribute '%s' is not defined on given instance of WeatherObserved (index %d)", req.body.attributes[j], i);
                    continue;
                }
                contextResponse.contextElement.attributes.push({
                    name: req.body.attributes[j],
                    ...normalizedWeatherObserved[req.body.attributes[j]]
                });
            }
        }
        catch(e) {
            if(e instanceof Error) {
                debug("Encountered common error while processing context request for station id '%s'", stationId)
                // Common error (Network, parsing, or something else)
                contextResponse.statusCode = {
                    code: "503", // Service Unavailable
                    reasonPhrase: e.message
                }
            }
            else if(e.msg !== undefined) {
                debug("Encountered API error while processing context request for station id '%s'", stationId)
                // API error
                contextResponse.statusCode = {
                    code: e.code.toString(),
                    reasonPhrase: e.msg
                };
            }
            else {
                debug("Encountered unknown error while processing context request for station id '%s'", stationId)
                // Unknown error
                contextResponse.statusCode = {
                    code: "500",
                    reasonPhrase: "Encountered unknown error while processing context element"
                };
            }
            debug("%O", e)
        }
        finally {
            response.contextResponses.push(contextResponse);
        }
    }
    // Send response back to context broker
    res.json(response);
}

var router = express.Router();
// Requests will contain NGSIv1 payloads in JSON format, therefore we need to parse the body using the express.json middleware
router.use(express.json());
router.post('/queryContext', handleContextRequest);

export default router;
