import express from 'express';
import Debug from 'debug';
import config from './config';
import wundergroundContextProvider from './wundergroundContextProvider';

const debug = Debug('provider:application');
const app = express();

debug('Setting up context provider routes');
app.use('/v2', wundergroundContextProvider);

app.listen(config.get('port'), () => {
    debug('Started context provider on port %d', config.get('port'));
});
