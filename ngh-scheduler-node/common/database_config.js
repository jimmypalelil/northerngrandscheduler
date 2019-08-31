module.exports = {
  url: process.env.MONGOLAB_URI,
  dbName: process.env.production ? 'nghscheduler_main' : "nghscheduler"
};
