'use strict'
// Dependencies
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;



// Comment schema
let commentSchema = new Schema({
    createdBy: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, {
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'lastModified'
        }
    });
// End commentSchema


// Sub task schema
let subTaskSchema = new Schema({
    createdBy: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    assignees: [],
    dueDate: {
        type: Date,
        default: null
    },
    comments: [commentSchema],
    isDone: {
        type: Boolean,
        default: false
    }
});
// End subTaskSchema


// Schema Declaration
let taskSchema = new Schema({
    taskId: {
        type: String,
        index: true,
        unique: true
    },
    listId: {
        type: String,
        required: true
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
    assignees: [],
    subTask: [subTaskSchema],
    comments: [commentSchema],
    dueDate: {
        type: Date,
        default: null
    },
    isDone: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'lastModified'
        }
    })
// End userSchema

mongoose.model('Task', taskSchema);