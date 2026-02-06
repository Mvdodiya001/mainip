// const mongoose = require('mongoose');

// const IPDataSchema = new mongoose.Schema({
//     id: {
//         type: String,
//     },
//     ip: {
//         type: String,
//         required: [true, 'IP Address is required property']
//     },
//     timestamp: {
//         type: String,
//         required: [true, 'Timestamp is required property']
//     },
//     MAC: {
//         type: String,
//     },
//     end: {
//         type: Boolean,
//     },
//     report: {
//         type: [],
//         required: [true, 'Report is required field'],
//     },
//     summary: {
//         type: [],
//         required: [true, 'Summary is required field'],
//     },
//     rawReport: {
//         type: String,
//     }
// });

// // IPDataSchema.index({timestamp: 1});

// const IPDataModel = mongoose.model('IPData', IPDataSchema);

// module.exports = IPDataModel;

const mongoose = require('mongoose');

const IPDataSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    ip: {
        type: String,
        required: [true, 'IP Address is required property']
    },
    timestamp: {
        type: String,
        required: [true, 'Timestamp is required property']
    },
    endtime: {
        type: String,
        required: [true, 'Timestamp is required property']
    },
    port: {
        type: Number,
    },
    coun: {
        type: Number,
    },
    MAC: {
        type: String,
    },
    demoendtime: {
        type: String,
        required: [true, 'Timestamp is required property']
    },
    end: {
        type: Boolean,
    },
    report: {
        type: [],
        required: [true, 'Report is required field'],
    },
    summary: {
        type: [],
        required: [true, 'Summary is required field'],
    },
    rawReport: {
        type: String,
    }
});

// IPDataSchema.index({timestamp: 1});

const IPDataModel = mongoose.model('IPData', IPDataSchema);

module.exports = IPDataModel;
