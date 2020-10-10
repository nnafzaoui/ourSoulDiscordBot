const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const kolshi = new Schema({
    songs : {
        type: String,
        required: true,
        unique: true,
        trim: true,
    }
})

const all = mongoose.model('all', kolshi);

module.exports = all;