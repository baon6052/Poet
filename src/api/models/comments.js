const mongoose = require('mongoose');

const commentsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    canvasId: mongoose.Schema.Types.ObjectId,
    commentParent: mongoose.Schema.Types.ObjectId,
    author: mongoose.Schema.Types.ObjectId,
    content: {
        type: String,
        required: true
    },
    date_commented: {
        type: Date,
        required: true
    },
    indentation: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Comments", commentsSchema);