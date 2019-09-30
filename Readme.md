# FIWARE Context Provider for the Weather Underground API

## General
This context provider serves as a bridge between the orion context broker and the weather underground API. This allows one to include weather station data from weather underground in NGSIv2 entities. The context provider exptects the following format as entity id:
```
urn:ngsi-ld:WeatherObserved:<Weather Underground Station ID>
```
Other formats are **not** supported at the moment. The definition of the data model `WeatherObserved` is part of the Smart Data Models and can be looked up [here](https://github.com/smart-data-models/dataModel.Weather/blob/master/WeatherObserved/doc/spec.md).

## Getting started
The context provider can be retrieved from the [docker hub](https://hub.docker.com/r/smartcitylab2050/provider.wunderground). Use the following command to spin up a new container named `wunderground`:
```
docker run -d --name wunderground -e DEBUG=provider:* -e PROVIDER_WUNDERGROUND_API_KEY=<API key> smartcitylab2050/provider.wunderground
```

## Environment variables
The context provider is configured using environment variables. By default, only the `PROVIDER_WUNDERGROUND_API_KEY` is required to spin up an instance of the context provider on port 3000 with a cache expire time of one minute.

| Key                           | Default Value | Description                                                               |
| ----------------------------- |:-------------:| ------------------------------------------------------------------------- |
| PROVIDER_PORT                 | `3000`        | Port used by the context provider                                         |
| PROVIDER_WUNDERGROUND_API_KEY | *none*        | Weather underground API key                                               |
| PROVIDER_CACHE_ENABLED        | `true`        | Enables / Disables the caching mechanism (reduces API requests)           |
| PROVIDER_CACHE_EXPIRE_TIME    | `60`          | Cache expire time in seconds                                              |
| DEBUG                         | *none*        | Debug log filter (set to `provider:*` to print all provider related logs) |

## Registering the context provider
The context provider needs to be registered at the orion context broker. This can be done using the following curl command. Adjust the station id, attributes and url to match your environment. For a complete list of all supported attributes, see [here](#attributes-provided).
```
curl -iX POST 'http://localhost:1026/v2/registrations' \
     -H 'Content-Type: application/json'
     -d '{
         "description": "Weather underground provider",
         "dataProvided": {
             "entities": [
                 {
                     "id": "urn:ngsi-ld:WeatherObserved:<Station ID>",
                     "type": "WeatherObserved"
                 }
             ],
             "attrs": [
                 "relativeHumidity"
             ]
         },
         "provider": {
             "http": {
                 "url": "http://wunderground:3000/v2"
             }
         }
     }'
```

## Attributes provided
The following attributes can be queried from the context provider. Have a look at the API documentation [here](https://docs.google.com/document/d/1eKCnKXI9xnoMGRRzOL1xPCBihNV2rOet08qpE_gArAY/edit) for more information about the attributes. All attributes with units are converted to SI base units to match the default units of the [WeatherObserved data model](https://github.com/smart-data-models/dataModel.Weather/blob/master/WeatherObserved/doc/spec.md).
* `atmosphericPressure`
* `dataProvider`
* `dewPoint`
* `precipitation`
* `relativeHumidity`
* `solarRadiation`
* `temperature`
* `windDirection`
* `windSpeed`
