const database  = require('../common/database_config');
var express = require('express');
var router = express.Router();
var moment = require('moment');
const uuid = require('uuid/v1');

const MongoClient = require('mongodb').MongoClient;

const {url, dbName} = database;
const collection = 'employees';

router.get('/getAll/:date', function(req, res, next) {
  const date = moment(req.params.date);
  const fromDate = date.format('YYYY-MM-DD');
  const scheduleColName = moment(req.params.date).format('MMMM YYYY');
  const scheduleColName2 = moment(req.params.date).add(1, 'months').format('MMMM YYYY');
  const toDate = moment(date).add(6, 'days').format('YYYY-MM-DD');

  (async function() {
    const client = new MongoClient(url, {useNewUrlParser: true});

    try {
      await client.connect();
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Get the collection
      const col = db.collection(collection);

      const pipeline = [
        {
          $lookup: {
            from: scheduleColName,
            let: {id: "$_id"},
            pipeline: [
              {
                $match: {$and: [{$expr: {$eq: ['$empId', '$$id']}}, {date: {$gte: fromDate}}, {date: {$lte: toDate}}]}
              },
              {
                $sort: {date: 1}
              }
            ],
            as: 'schedule'
          }
        },
        {
          $lookup: {
            from: scheduleColName2,
            let: {id: "$_id"},
            pipeline: [
              {
                $match: {$and: [{$expr: {$eq: ['$empId', '$$id']}}, {date: {$gte: fromDate}}, {date: {$lte: toDate}}]}
              },
              {
                $sort: {date: 1}
              }
            ],
            as: 'schedule2'
          }
        }
      ];

      // Get first two documents that match the query
      const docs = await col.aggregate(pipeline).toArray();
      res.send(docs);
    } catch (err) {
      console.log(err.stack);
    }

    // Close connection
    client.close();
  })();
});

router.get('/delete/:id', function(req, res, next) {
  const id = req.params.id;

  (async function() {
    const client = new MongoClient(url, {useNewUrlParser: true});

    try {
      await client.connect();
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Get the collection
      const col = db.collection(collection);

      await col.removeOne({_id: id});

      db.listCollections().toArray((err, collInfos) => {
        collInfos.forEach(col => {
          if (col.name !== 'system.indexes' && col.name !== 'employees') {
            removeUser(col.name, id);
          }
        })
      });

      req.app.io.emit('employeeRemoved');

      res.send({msg: 'Employee was removed successfully!!!'});

    } catch (err) {
      console.log(err.stack);
    }

    // Close connection
    client.close();
  })();
});

function removeUser(collectionName, empId) {
  (async function() {
    const client = new MongoClient(url, {useNewUrlParser: true});

    try {
      await client.connect();
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Get the collection
      const col = db.collection(collectionName);

      await col.removeMany({empId: empId});
    } catch (err) {
      console.log(err.stack);
      client.close();
    }
  })();
}

router.post('/add', function(req, res, next) {
  let {_id, name, wage, from, to} = req.body;
  name = name.trim();

  (async function() {
    const client = new MongoClient(url, {useNewUrlParser: true});

    try {
      await client.connect();
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Get the collection
      const col = db.collection(collection);

      if (!_id) {
        _id = uuid();
      }

      await col.updateOne({_id: _id}, {$set:{wage, name, from, to}}, {upsert: true});

      req.app.io.emit('employeeAdded');

      res.send({msg: 'Employee Saved'});
    } catch (err) {
      res.send(err);
      console.log(err);
    }

    // Close connection
    client.close();
  })();
});

module.exports = router;
