const mongoose = require('mongoose');

const  RouterScanSchema = new mongoose.Schema({
    timestamp: {
        type: String,
        required: [true, 'Timestamp is required property']
    },
    numberOfIP: {
        type: String,
        required: [true, 'Number of IP is required property'],
        default: 0,
    },
    IPScanIds: {
        type: [mongoose.Schema.ObjectId],
        ref: 'IPData',
        default: []
    }
})

const RouterScanModel = mongoose.model('RouterScanData', RouterScanSchema);

module.exports = RouterScanModel;