'use strict'
// Dependencies
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Schema Declaration
let listSchema = new Schema({
    listId: {
        type: String,
        index: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: String,
        required: true
    },
    tasks: [],
    notes: {
        type: String,
        default: ''
    },
    collaborators: [],
    isDone: {
        type: Boolean,
        default: false
    }
}, {
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'lastModified'
        }
    })
// end userSchema


mongoose.model('List', listSchema);