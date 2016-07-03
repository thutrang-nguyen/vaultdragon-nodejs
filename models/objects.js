var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objectSchema = new Schema({
	_name : {type: String, required: true, trim: true},
	values : [ {type: Schema.Types.ObjectId, ref: 'values'} ]
});

var objects = mongoose.model('objects', objectSchema);

module.exports = {Objects: objects};