import config from './config';
import express from 'express';
import Debug from 'debug';
import wundergroundContextProvider from './wundergroundContextProvider';

const debug = Debug('provider:application');
var app = express();

debug('Setting up context provider routes');
app.use('/v1', wundergroundContextProvider);

app.listen(config.get('port'), () => {
    debug('Started context provider on port %d', config.get('port'));
});