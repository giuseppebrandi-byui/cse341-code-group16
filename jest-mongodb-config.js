// jest-mongodb-config.js
module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '4.0.3', // Use a version compatible with your MongoDB version
      skipMD5: true,
    },
    instance: {
      dbName: 'online_doctor',
    },
    autoStart: false,
  },
};