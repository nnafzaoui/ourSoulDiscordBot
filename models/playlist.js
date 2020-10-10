const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Playlist = new Schema({
    owner: {
        type: String,
        required: true,
    },
    song : {
        type: String,
        required: true,
        unique: true,
        trim: true,
    }
})

const Music = mongoose.model('Music', Playlist);

module.exports = Music;