var Objects = require('../models/objects').Objects;
var Values = require('../models/values').Values;

// Objects Routes
var express = require('express');
var router = express.Router();

router.route('/')
	.get(function(req, res) {
		res.status(404).json({message: "404 Not found. Please use the right route for this API."});
	})
	.post(function(req, res) {
		var data = req.body;
		if (data) {
			for (var key in data) {
				var thisKey = key;
				var thisValue = data[key];
			}
		} else {
			res.status(500).json({message: "Could not update database. Error: No data parsed."});
		}

		Objects.findOne({_name: thisKey}, function(err, doc) {
			if (!err && Object.keys(doc).length === 0) {
				// Create new Object and new Value
				var newObject = new Objects({_name: thisKey});
				newObject.save(function(err) {
					if (err) {
						res.status(500).json({message: "Could not update database. Error: " + err});
					} 

					var newValue = new Values({
						_key: newObject._name,
						val: thisValue, 
						ts: Math.floor((new Date()).getTime() / 1000)
					});
					newValue.save(function(error) {
						if (error) {
							res.status(500).json({message: "Could not update database. Error: " + error});
						} else {
							res.status(201).json({message: "Updated database with key: " + newObject._name});
						}
					});
				});
			} else if (!err) {
				// Create new Value
				var newValue = new Values({
					_key: thisKey,
					val: thisValue, 
					ts: Math.floor((new Date()).getTime() / 1000)
				});
				newValue.save(function(error) {
					if (error) {
						res.status(500).json({message: "Could not update database. Error: " + error});
					} else {
						res.status(201).json({message: "Updated database with key: " + thisKey});
					}
				});
			} else {
				res.status(500).json({message: "Could not update database. Error: " + err});
			}
		})
	});

// router.route('/delete')
// 	.get(function(req, res) {
// 		Objects.remove({}, function(err){});
// 		Values.remove({}, function(err){});
// 	});

router.route('/:key')
	.get(function(req, res) {
		var thisKey = req.params.key;
		var timestamp = req.query.timestamp;

		if (timestamp) {
			// timestamp is given
			Values
				.find({
					_key: thisKey,
					ts: timestamp
				})
				.limit(1)
				.exec(function(err, doc) {
					if (!err && Object.keys(doc).length !== 0) {
						res.status(200).json(doc[0]['val']);
					} else if (err) {
						res.status(500).json({message: "Error loading key." + err});
					} else {
						res.status(404).json({message: "Value in given timestamp not found."});
					}
				});
		} else {
			// default - return the latest value
			Values
				.find({_key: thisKey})
				.limit(1)
				.sort({ts: -1})
				.exec(function(err, doc) {
					if (!err && Object.keys(doc).length !== 0) {
						res.status(200).json(doc[0]['val']);
					} else if (err) {
						res.status(500).json({message: "Error loading key." + err});
					} else {
						res.status(404).json({message: "Key not found."});
					}
				});
		}
	});

module.exports = router;
