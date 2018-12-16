// modules dependencies.
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');

// Models 
const listModel = mongoose.model('List')


// Create list 
let createList = (req, res) => {

    if (check.isEmpty(req.body.title)) {
        let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
        res.send(apiResponse)
    } else {
        let listId = shortid.generate()
        let newList = new listModel({
            listId: listId,
            createdBy: req.body.createdBy,
            title: req.body.title,
            notes: req.body.notes,
        }) // end new list model

        newList.save((err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else {
                console.log('Success in list creation')
                let apiResponse = response.generate(false, 'Success in list creation', 200, result)
                res.send(apiResponse)
            }
        }) // end newMeeting save
    }// end else

}// end create list


// Get all list details 
let getAllLists = (req, res) => {

    listModel.find({ "createdBy": req.params.userId })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'List Controller: getAllLists', 10)
                let apiResponse = response.generate(true, 'Failed To Find List Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No List Found', 'List Controller: getAllLists')
                let apiResponse = response.generate(true, 'No List Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All List Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get all lists


// Get single list details 
let getSingleList = (req, res) => {

    listModel.findOne({ 'listId': req.params.listId })
        .select('-__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'List Controller: getSingleList', 10)
                let apiResponse = response.generate(true, 'Failed To Find List Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No List Found', 'List Controller:getSingleList')
                let apiResponse = response.generate(true, 'No List Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'List Details Found', 200, result)
                res.send(apiResponse)
            }
        })

}// end get single list


let getSharedLists = (req, res) => {
    listModel.find({ "collaborators": req.params.userId })
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'List Controller: getAllLists', 10)
                let apiResponse = response.generate(true, 'Failed To Find List Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No List Found', 'List Controller: getAllLists')
                let apiResponse = response.generate(true, 'No List Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Shared List(s) Found', 200, result)
                res.send(apiResponse)
            }
        })
}

// Edit list
let editList = (req, res) => {

    let options = req.body;
    listModel.update({ 'listId': req.params.listId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'list Controller:editlist', 10)
            let apiResponse = response.generate(true, 'Failed To edit list details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No list Found', 'list Controller: editlist')
            let apiResponse = response.generate(true, 'No list Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'list details edited', 200, result)
            res.send(apiResponse)
        }
    });

}// end edit list


// Delete list
let deleteList = (req, res) => {

    listModel.findOneAndRemove({ 'listId': req.params.listId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'List Controller: deletelist', 10)
            let apiResponse = response.generate(true, 'Failed To delete list', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No list Found', 'list Controller: deletelist')
            let apiResponse = response.generate(true, 'No list Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the list successfully', 200, result)
            res.send(apiResponse)
        }
    });

}// end delete list


module.exports = {

    createList: createList,
    getAllLists: getAllLists,
    getSingleList: getSingleList,
    getSharedLists: getSharedLists,
    editList: editList,
    deleteList: deleteList

}// end exports