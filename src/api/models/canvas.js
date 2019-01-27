const mongoose = require('mongoose');

const canvasSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date_published: {
        type: Date,
        required: true
    },
    canvas_image: {
        type: String,
        required: true
    },
    reads:{
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Canvas', canvasSchema);