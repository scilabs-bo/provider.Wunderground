// @ts-ignore
import WeatherUndergroundNode from 'weather-underground-node';
import express, { Response, Request } from 'express';
import config from './config';
import Debug from 'debug';
import { ProviderResponse, ContextElement, Attribute } from './models/context';

// Setup debug for logging and default router
const debugRequest = Debug('provider:request');
const debugWU = Debug('provider:wunderground');
var wunderground = new WeatherUndergroundNode(config.get('key'));

function parseToContextElement(entity : { type : string, isPattern : boolean, id : string }, stationData : any, attributes : string[]) {
    let element = new ContextElement();
    // Copy values from request entity
    element.id = entity.id;
    element.type = entity.type;
    element.isPattern = entity.isPattern;
    // Parse requested attributes
    attributes.forEach(function (attributeName) {
        let attribute = new Attribute();
        attribute.name = attributeName;
        switch (attributeName) {
            case 'dateObserved':
                attribute.type = 'DateTime';
                attribute.value = stationData.obsTimeUtc;
                break;
            case 'location':
                attribute.type = 'geo:json';
                attribute.value = {
                    type: 'Point',
                    coordinates: [ stationData.lon, stationData.lat, stationData.metric.elev ]
                };
                break;
            case 'relativeHumidity':
                attribute.type = 'Number';
                attribute.value = stationData.humidity;
                break;
            case '':
            default:
                // Unknown attribute
                throw new Error(`Encountered unsupported attribute '${attribute}' while parsing station data into context element`);
        }
        element.attributes.push(attribute);
    });
    return element;
}

var router = express.Router();
// Requests will contain NGSIv1 payloads in JSON format, therefore we need to parse the body using the express.json middleware
router.use(express.json());
router.post('/queryContext', async function (req : Request, res : Response) {
    debugRequest("Received a new request to the queryContext endpoint to deliver %o", req.body.attributes);
    // TODO: Make sure the request body is NGSIv1 conforming
    // TODO: Error handling
    let response = new ProviderResponse();
    let apiCalls = req.body.entities.map((entity : { type : string, isPattern : boolean, id : string }) => {
        // Map wunderground callback to promise
        return new Promise((resolve, reject) => {
            debugWU("Requesting current conditions for station id '%s' from weather underground API", "KMAHANOV10");
            wunderground.PWSCurrentContitions("KMAHANOV10").request(function (err : any, response : any) {
                if(err)
                    reject(err);
                resolve(response);
            })
        });
    });

    // Perform API calls
    let apiData;
    try {
        apiData = await Promise.all(apiCalls);
        console.log(JSON.stringify(apiData));
    }
    catch(err) {
        // Error accessing API data, log error and send status 500 back to requesting context broker
        debugWU("Retrieving API data failed: '%s'", err.msg);
        return res.status(500).end();
    }

    // Create a context response object for each requested entity
    apiData.forEach((stationData, index) => {
        response.contextResponses.push({
            contextElement: parseToContextElement(req.body.entities[index], stationData, req.body.attributes),
            statusCode: {
                code: "200",
                reasonPhrase: "OK"
            }
        });
    });
    
    res.json(response);
    debugRequest("Served request successfully");
});

export default router;
