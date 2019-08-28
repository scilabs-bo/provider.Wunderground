import convict from 'convict';

let config = convict({
    key: {
        doc: 'Wunderground API key',
        format: function (val : string) {
            if(!/^[a-f0-9]{32}$/.test(val))
                throw new Error("Weather Underground API keys are 32 character hex strings")
        },
        default: '',
        env: 'WUNDERGROUND_API_KEY'
    },
    port: {
        doc: 'Context provider port',
        format: 'port',
        default: 80,
        env: 'PORT'
    }
});
// Validate configuration before exporting to prevent configuration errors
config.validate({ strict: true });
export default config;