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
const listModel = mongoose.model('List')

// Array containing undo actions
let undoStack = [];


let undo = async (req, res) => {
    let undoAction = undoStack.pop();
    if (!undoAction) res.send(response.generate(true, 'No undo available', 404, null))
    let undoData = await undoAction.action();
    undoStack.pop();
    let apiResponse = response.generate(false, 'Undo successfull', 200, undoData);
    res.send(apiResponse)
}


// Create task 
let createTask = (req, res) => {

    let taskId = shortid.generate();

    let addTaskToList = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.title && req.body.listId)) {
                let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
                reject(apiResponse)
            } else {
                listModel.findOneAndUpdate({ "listId": req.body.listId },
                    { $push: { tasks: taskId } },
                    (error, result) => {
                        if (error) {
                            logger.error(`Error Occured : ${error}`, 'Database', 10)
                            let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                            res.send(apiResponse)
                            reject(error)
                        } else {
                            resolve()
                        }
                    });
            }
        })
    }// end addTaskToList

    let newTask = () => {

        return new Promise((resolve, reject) => {
            let newTask = new taskModel({
                taskId: taskId,
                listId: req.body.listId,
                createdBy: req.body.createdBy,
                title: req.body.title,
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
            }) // end newTask save
        }) // end promise

    } // end newTask function

    // promise call
    addTaskToList()
        .then(newTask)
        .then((task) => {
            undoReq = {
                body: { listId: task.listId },
                params: { taskId: task.taskId }
            }
            undoStack.push({ action: () => deleteTask(undoReq) });
            let apiResponse = response.generate(false, 'Task Created successfully', 200, task);
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log("error handler");
            console.log(err);
            res.status(err.status)
            res.send(err)
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
                    logger.error(`Error Occured : ${error}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                    res.send(apiResponse);
                } else {
                    undoReq = {
                        params: { taskId: result.taskId, subTask_id: result.subTask_id }
                    }
                    undoStack.push({ action: () => deleteSubTask(undoReq) });
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
                    undoReq = {
                        body: { comment_id: result._id },
                        params: { taskId: req.params.taskId }
                    }
                    undoStack.push({ action: () => deleteComment(undoReq) });
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
                    undoReq = {
                        body: { subTask_id: req.body.subTask_id, comment_id: result._id },
                        params: { taskId: req.params.taskId }
                    }
                    undoStack.push({ action: () => deleteSubTaskComment(undoReq) });
                    let apiResponse = response.generate(false, 'Sub task  comment added', 200, result)
                    res.send(apiResponse)
                }
            });
    }

}// end createTaskComment 


// Get all task details 
let getAllTasks = (req, res) => {

    let filter = req.query.fields ? req.query.fields.replace(new RegExp(";", 'g'), " ") : '';
    taskModel.find({ 'createdBy': req.params.userId, 'removed': false })
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

// Get all List tasks
let getListTasks = (req, res) => {
    let filter = req.query.fields ? req.query.fields.replace(new RegExp(";", 'g'), " ") : '';
    // taskModel.find({ 'createdBy': req.query.userId })
    taskModel.find({ listId: req.params.listId, removed: false })
        .select(`-__v ${filter}`)
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'Task Controller: getListTasks', 10)
                let apiResponse = response.generate(true, 'Failed To Find Task Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Task Found', 'Task Controller: getListTasks')
                let apiResponse = response.generate(true, 'No Task Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All Task Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all list tasks


// Get single task details 
let getSingleTask = (req, res) => {

    let filter = req.query.fields ? req.query.fields.replace(new RegExp(";", 'g'), " ") : '';
    taskModel.findOne({ 'taskId': req.params.taskId, removed: false })
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
    taskModel.findOneAndUpdate({ 'taskId': req.params.taskId }, options).exec((err, result) => {
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
            delete (result.createdOn)
            delete (result.lastModified)
            undoReq = {
                body: result,
                params: { taskId: req.params.taskId }
            }
            undoStack.push({ action: () => editTask(undoReq) });
            let apiResponse = response.generate(false, 'task details edited', 200, result)
            if (res) res.send(apiResponse)
        }
    });

}// end edit task


// Edit comment
let editComment = (req, res) => {

    taskModel.findOneAndUpdate({ 'taskId': req.params.taskId, 'comments._id': req.body.comment_id },
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
                let commentBodyBeforeEdit = result.comments.filter(comment => comment._id == req.body.comment_id)[0].body;
                undoReq = {
                    body: { comment_id: req.body.comment_id, body: commentBodyBeforeEdit },
                    params: { taskId: req.params.taskId }
                }
                undoStack.push({ action: () => editComment(undoReq) });
                let apiResponse = response.generate(false, 'Comment edited', 200, result)
                res.send(apiResponse)
            }
        });

}// end edit comment


let setSubTaskStatus = (req, res) => {
    taskModel.updateOne({ 'taskId': req.params.taskId, 'subTask._id': req.params.subTask_id },
        { $set: { 'subTask.$.isDone': req.body.isDone } }, (err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'task Controller: editSubTask', 10)
                let apiResponse = response.generate(true, 'Failed To edit subTask', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No subTask Found', 'task Controller: editSubTask')
                let apiResponse = response.generate(true, 'No subtask Found', 404, null)
                res.send(apiResponse)
            } else {
                undoReq = {
                    body: { isDone: !isDone },
                    params: { taskId: req.params.taskId, subTask_id: req.params.subTask_id }
                }
                undoStack.push({ action: () => setSubTaskStatus(undoReq) });
                let apiResponse = response.generate(false, 'Subtask edited', 200, result)
                res.send(apiResponse)
            }
        })
}

// Edit comment
let editSubTaskComment = (req, res) => {

    taskModel.findOneAndUpdate({ 'taskId': req.params.taskId, 'subTask._id': req.body.subTask_id },
        { $set: { 'subTask.$.comments': { body: req.body.body } } }, (err, result) => {
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
                let subTask = result.subTask.filter(task => task._id == req.body.subTask_id)[0];
                let commentBodyBeforeEdit = subTask.comments.filter(comment => comment._id == req.body.comment_id)[0].body;
                undoReq = {
                    body: { comment_id: req.body.comment_id, body: commentBodyBeforeEdit },
                    params: { taskId: req.params.taskId }
                }
                undoStack.push({ action: () => editSubTaskComment(undoReq) });
                let apiResponse = response.generate(false, 'Comment edited', 200, result)
                res.send(apiResponse)
            }
        });

}// end editSubTaskComment


// Delete task
let deleteTask = (req, res) => {

    let removeTaskFromList = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.listId && req.params.taskId)) {
                let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
                reject(apiResponse)
            } else {
                listModel.findOneAndUpdate({ "listId": req.body.listId },
                    { $pull: { tasks: req.params.taskId } },
                    (error, result) => {
                        if (error) {
                            logger.error(`Error Occured : ${error}`, 'Database', 10)
                            let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                            res.send(apiResponse)
                            reject(error)
                        } else {
                            resolve()
                        }
                    });
            }
        })
    }// end addTaskToList

    let removeTask = () => {
        return new Promise((resolve, reject) => {
            taskModel.findOneAndUpdate({ 'taskId': req.params.taskId }, { 'removed': true }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Task Controller: deletetask', 10)
                    let apiResponse = response.generate(true, 'Failed To delete task', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No task Found', 'task Controller: deletetask')
                    let apiResponse = response.generate(true, 'No task Found', 404, null)
                    reject(apiResponse)
                } else {
                    resolve(result)
                }
            });
        })
    }// end removeTask

    // promise call
    return removeTaskFromList()
        .then(removeTask)
        .then((result) => {
            if (res) {
                undoStack.push({ action: () => reviveTask(req.body.listId, req.params.taskId) });
                let apiResponse = response.generate(false, 'Task deleted successfully', 200, result);
                res.send(apiResponse);
            } else {
                return result.data
            }
        })
        .catch((err) => {
            console.log("error handler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}// end delete task

let reviveTask = (listId, taskId) => {

    let addTaskToList = () => {
        return new Promise((resolve, reject) => {
            listModel.findOneAndUpdate({ "listId": listId },
                { $push: { tasks: taskId } },
                (error, result) => {
                    if (error) {
                        logger.error(`Error Occured : ${error}`, 'Database', 10)
                        reject(error)
                    } else resolve()
                });
        })
    }// end addTaskToList

    let addTask = () => {
        return new Promise((resolve, reject) => {
            taskModel.findOneAndUpdate({ 'taskId': req.params.taskId }, { 'removed': false }).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'Task Controller: reviveTask', 10)
                    reject()
                } else if (check.isEmpty(result)) {
                    logger.info('No task Found', 'task Controller: reviveTask')
                    reject()
                } else resolve()
            });
        })
    }// end removeTask

    // promise call
    return removeTaskFromList()
        .then(removeTask)
        .catch((err) => {
            console.log("error handler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}// end reviveTask


let deleteSubTask = (req, res) => {
    taskModel.updateOne(
        { taskId: req.params.taskId },
        { $pull: { subTask: { _id: req.params.subTask_id } } },
        (error, result) => {
            if (error) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${error}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse);
            } else {
                // result.comments.push(newComment)
                console.log('Subtask deleted')
                let apiResponse = response.generate(false, 'Subtask deleted', 200, result)
                if (res) res.send(apiResponse);
            }
        });
}// emd  deleteSubTask

let reviveSubTask = (listId, taskId) => {

    taskModel.updateOne({ 'taskId': req.params.taskId }, { 'removed': false }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'Task Controller: reviveTask', 10)
            reject()
        } else if (check.isEmpty(result)) {
            logger.info('No task Found', 'task Controller: reviveTask')
            reject()
        } else resolve()
    });

}// end reviveTask

// Delete task
let deleteComment = (req, res) => {
    console.log('TASK ID>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.params.taskId)
    console.log('COMMENT ID>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body.comment_id)
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
                console.log('comment deleted')
                let apiResponse = response.generate(false, 'Comment created.', 200, result)
                if (res) res.send(apiResponse);
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
    getListTasks: getListTasks,
    getSingleTask: getSingleTask,
    editTask: editTask,
    setSubTaskStatus: setSubTaskStatus,
    editComment: editComment,
    editSubTaskComment: editSubTaskComment,
    deleteTask: deleteTask,
    deleteSubTask: deleteSubTask,
    deleteComment: deleteComment,
    deleteSubTaskComment: deleteSubTaskComment,
    undo: undo

}// end exports