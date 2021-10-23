const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }],
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
})

const Favorite = mongoose.model('Favorite', fampsiteSchema);

module.exports = Favorite;