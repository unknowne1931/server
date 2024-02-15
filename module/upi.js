const mongoose = require('mongoose');

const UPISchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String
});

module.exports = mongoose.model('UPI', UPISchema);