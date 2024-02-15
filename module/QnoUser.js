const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
    Time : String,
    ip : String,
    Country : String,
    Qno : String
});

module.exports = mongoose.model('Users', UsersSchema);