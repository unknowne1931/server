const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String,
    upi : String,
    name: String,
});

module.exports = mongoose.model('Account', AccountSchema);