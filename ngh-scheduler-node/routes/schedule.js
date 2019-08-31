const database  = require('../common/database_config');
var express = require('express');
var router = express.Router();
var moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const {url, dbName} = database;

router.post('/status', function(req, res, next) {
  const {date, _id, status, rowIndex} = req.body;
  const scheduleColName = moment(date).format('MMMM YYYY');

  (async function() {
    const client = new MongoClient(url, {useNewUrlParser: true});

    try {
      await client.connect();
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Get the collection
      const col = db.collection(scheduleColName);

      if (status === 'OFF') {
        await col.removeOne({_id: date + _id});
      } else {
        await col.updateOne({_id: date + _id}, {$set: {date, empId: _id, status}}, {upsert: true});
      }

      req.app.io.emit('statusUpdated', {_id, date, status, rowIndex});

      res.send({msg: 'Changes Saved'});
    } catch (err) {
      console.log(err.stack);
    }

    // Close connection
    client.close();
  })();
});

module.exports = router;

