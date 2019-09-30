import convict from 'convict';

let config = convict({
    cache: {
        enabled: {
            doc: 'Enable / Disable cache',
            format: Boolean,
            default: true,
            env: 'PROVIDER_CACHE_ENABLED'
        },
        expireTime: {
            doc: 'Seconds before a cache entry expires',
            format: 'int',
            default: 60,
            env: 'PROVIDER_CACHE_EXPIRE_TIME'
        }
    },
    key: {
        doc: 'Wunderground API key',
        format: function (val : string) {
            if(!/^[a-f0-9]{32}$/.test(val))
                throw new Error("Weather Underground API keys are 32 character hex strings")
        },
        default: '',
        env: 'PROVIDER_WUNDERGROUND_API_KEY'
    },
    port: {
        doc: 'Context provider port',
        format: 'port',
        default: 3000,
        env: 'PROVIDER_PORT'
    }
});
// Validate configuration before exporting to prevent configuration errors
config.validate({ strict: true });
export default config;