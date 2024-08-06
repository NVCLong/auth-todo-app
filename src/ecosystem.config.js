module.exports = {
    apps: [
      {
        name: 'TodoApp',
        script: './dist/src/main.js',
        instances: '2',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'development',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };