module.exports = {
    apps: [{
        name: 'scarlet-sync-agent',
        script: './dist/agent.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            SHOP_ID: 'scarlet_shop_01'
        }
    }]
};
