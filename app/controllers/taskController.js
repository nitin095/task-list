// modules dependencies.
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const mailer = require('../libs/mailer')

// Models 
const taskModel = mongoose.model('Task')

// Create task 
let createTask = (req, res) => {

    let newTask = () => {

        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.title)) {
                let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
                reject(apiResponse)
            } else {
                let taskId = shortid.generate()
                let newTask = new taskModel({
                    taskId: taskId,
                    createdBy: req.body.createdBy,
                    title: req.body.title,
                    // dueDate: req.body.dueDate
                }) // end new task model

                let assignees = (req.body.assignees != undefined && req.body.assignees != null && req.body.assignees != '') ? req.body.assignees.split(',') : [];
                newTask.assignees = assignees;

                newTask.save((err, result) => {
                    if (err) {
                        console.log('Error Occured.')
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } else {
                        console.log('Success in task creation')
                        resolve(result)
                    }
                }) // end newMeeting save
            }// end else
        }) // end new Meeting promise

    } // end newMeeting function

    // promise call
    newTask()
        .then((result) => {
            let apiResponse = response.generate(false, 'Task Created successfully', 200, result);
            res.send(apiResponse);
        })
        .catch((error) => {
            console.log(error)
            res.send(error)
        })

}// end create task


// Create sub task 
let createSubTask = (req, res) => {

    if (check.isEmpty(req.body.title)) {
        let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
        res.send(apiResponse)
    } else {
        let newSubTask = {
            createdBy: req.body.createdBy,
            title: req.body.title
        }
        let assignees = (req.body.assignees != undefined && req.body.assignees != null && req.body.assignees != '') ? req.body.assignees.split(',') : [];
        newSubTask.assignees = assignees;
        taskModel.findOneAndUpdate(
            { taskId: req.params.taskId },
            { $push: { subTask: newSubTask } },
            (error, result) => {
                if (error) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    res.send(apiResponse);
                } else {
                    result.subTask.push(newSubTask)
                    console.log('Success in sub task creation')
                    let apiResponse = response.generate(false, 'Sub task created.', 200, result)
                    res.send(apiResponse);
                }
            });
    } // end else

}// end create task


// Create task comment
let createTaskComment = (req, res) => {

    if (check.isEmpty(req.body.body)) {
        let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
        res.send(apiResponse);
    } else {
        let newComment = {
            createdBy: req.body.createdBy,
            body: req.body.body
        }
        taskModel.findOneAndUpdate(
            { taskId: req.params.taskId },
            { $push: { comments: newComment } },
            (error, result) => {
                if (error) {
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    res.send(apiResponse);
                } else {
                    // result.comments.push(newComment)
                    console.log('Success in comment creation')
                    let apiResponse = response.generate(false, 'Comment created.', 200, result)
                    res.send(apiResponse);
                }
            });
    }// end else

}// end createTaskComment 


// Create sub task comment
let createSubTaskComment = (req, res) => {

    if (check.isEmpty(req.body.body)) {
        let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
        res.send(apiResponse);
    } else {
        let newComment = {
            createdBy: req.body.createdBy,
            body: req.body.body
        }
        taskModel.update({ 'taskId': req.params.taskId, 'subTask._id': req.body.subTask_id },
            {
                $push: { 'subTask.$.comments': newComment }
            }, { upsert: true }, function (err, result) {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Task Controller: createSubTaskComment', 10)
                    let apiResponse = response.generate(true, 'Failed To add subtask comment', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No Task Found', 'Task Controller: createSubTaskComment')
                    let apiResponse = response.generate(true, 'No Task Found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Sub task  comment added', 200, result)
                    res.send(apiResponse)
                }
            });
    }

}// end createTaskComment 


// Get all task details 
let getAllTasks = (req, res) => {

    let filter = req.query.fields ? req.query.fields.replace(new RegExp(";", 'g'), " ") : '';
    // taskModel.find({ 'createdBy': req.query.userId })
    taskModel.find()
        .select(`-__v ${filter}`)
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Task Controller: getAllTasks', 10)
                let apiResponse = response.generate(true, 'Failed To Find Task Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Task Found', 'Task Controller: getAllTasks')
                let apiResponse = response.generate(true, 'No Task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Task Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get all tasks


// Get single task details 
let getSingleTask = (req, res) => {

    let filter = req.query.fields.replace(new RegExp(";", 'g'), " ");
    taskModel.findOne({ 'taskId': req.params.taskId })
        .select(`-__v -_id ${filter}`)
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Task Controller: getSingleTask', 10)
                let apiResponse = response.generate(true, 'Failed To Find Task Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Task Found', 'Task Controller:getSingleTask')
                let apiResponse = response.generate(true, 'No Task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Task Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get single task


// Edit task
let editTask = (req, res) => {

    let options = req.body;
    taskModel.update({ 'taskId': req.params.taskId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'task Controller:edittask', 10)
            let apiResponse = response.generate(true, 'Failed To edit task details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No task Found', 'task Controller: edittask')
            let apiResponse = response.generate(true, 'No task Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'task details edited', 200, result)
            res.send(apiResponse)
        }
    });

}// end edit task


// Edit comment
let editComment = (req, res) => {

    taskModel.updateOne({ 'taskId': req.params.taskId, 'comments._id': req.body.comment_id },
        { 'comments.$.body': req.body.body }).exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'task Controller: editComment', 10)
                let apiResponse = response.generate(true, 'Failed To edit comment', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No comment Found', 'task Controller: editComment')
                let apiResponse = response.generate(true, 'No task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Comment edited', 200, result)
                res.send(apiResponse)
            }
        });

}// end edit comment


// Edit comment
let editSubTaskComment = (req, res) => {

    taskModel.updateOne({ 'taskId': req.params.taskId, 'subTask._id': req.body.subTask_id },
    { $set: { 'subTask.$.comments': { body: req.body.body } } },  function (err, result) {
            if (err) {
                console.log(err)
                logger.error(err.message, 'task Controller: editSubTaskComment', 10)
                let apiResponse = response.generate(true, 'Failed To edit comment', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No comment Found', 'task Controller: editSubTaskComment')
                let apiResponse = response.generate(true, 'No task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Comment edited', 200, result)
                res.send(apiResponse)
            }
        });

}// end editSubTaskComment


// Delete task
let deleteTask = (req, res) => {

    taskModel.findOneAndRemove({ 'taskId': req.params.taskId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Task Controller: deletetask', 10)
            let apiResponse = response.generate(true, 'Failed To delete task', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No task Found', 'task Controller: deletetask')
            let apiResponse = response.generate(true, 'No task Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the task successfully', 200, result)
            res.send(apiResponse)
        }
    });

}// end delete task


// Delete task
let deleteComment = (req, res) => {

    taskModel.updateOne(
        { taskId: req.params.taskId },
        { $pull: { comments: { _id: req.body.comment_id } } },
        (error, result) => {
            if (error) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${error}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse);
            } else {
                // result.comments.push(newComment)
                console.log('Success in comment creation')
                let apiResponse = response.generate(false, 'Comment created.', 200, result)
                res.send(apiResponse);
            }
        });

}// end delete task


// Delete task
let deleteSubTaskComment = (req, res) => {

    taskModel.update({ 'taskId': req.params.taskId, 'subTask._id': req.body.subTask_id },
        { $pull: { 'subTask.$.comments': { _id: req.body.comment_id } } }, { upsert: true }, function (err, result) {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Task Controller: createSubTaskComment', 10)
                let apiResponse = response.generate(true, 'Failed To add subtask comment', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Task Found', 'Task Controller: createSubTaskComment')
                let apiResponse = response.generate(true, 'No Task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Sub task  comment added', 200, result)
                res.send(apiResponse)
            }
        });

}// end delete task


module.exports = {

    createTask: createTask,
    createSubTask: createSubTask,
    createTaskComment: createTaskComment,
    createSubTaskComment: createSubTaskComment,
    getAllTasks: getAllTasks,
    getSingleTask: getSingleTask,
    editTask: editTask,
    editComment: editComment,
    editSubTaskComment: editSubTaskComment,
    deleteTask: deleteTask,
    deleteComment: deleteComment,
    deleteSubTaskComment: deleteSubTaskComment

}// end exports