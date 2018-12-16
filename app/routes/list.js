const express = require('express');
const router = express.Router();
const listController = require("./../../app/controllers/listController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

	let baseUrl = `${appConfig.apiVersion}/lists`;

	// defining routes.

	app.get(`${baseUrl}/all/:userId`, auth.isAuthorized, listController.getAllLists);

    /**
	 * @api {get} /api/v1/lists/view/:userId Get all lists created by the user
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} title title of the list passed as the Body parameter
	 * @apiParam {String} notes notes of the list passed as the Body parameter
	 * @apiParam {String} collaborators user ids of the list collaborators passed as the Body parameter
	 * @apiParam {String} isDone done status of the list passed as the Body parameter
	 * @apiParam {String} tasks tasks ids of the list passed as the Body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List edited",
	    "status": 200,
	    "data": [
				 	{
						"tasks": [
							"taskId1",
							"taskId2"
						],
						"notes": "String",
						"collaborators": [Array<string>],
						"isDone": Boolean,
						"listId": "String",
						"createdBy": "String",
						"title": "String",
						"createdOn": "Date",
						"lastModified": "Date"
        			}
	    		]
	    }
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To Find List Details",
	    "status": 500,
	    "data": null
	   }
	 */


	app.get(`${baseUrl}/:listId/details`, auth.isAuthorized, listController.getSingleList);

    /**
	 * @api {get} /api/v1/lists/:listId/details Get a single list
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} listId The listId should be passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List Found Successfully.",
	    "status": 200,
	    "data": {
					"tasks": [
						"taskId1",
						"taskId2"
					],
					"notes": "String",
					"collaborators": [Array<string>],
					"isDone": Boolean,
					"listId": "String",
					"createdBy": "String",
					"title": "String",
					"createdOn": "Date",
					"lastModified": "Date"
        		}
	    }
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.",
	    "status": 500,
	    "data": null
	   }
	 */


	app.get(`${baseUrl}/shared/:userId`, auth.isAuthorized, listController.getSharedLists);

    /**
	 * @api {get} /api/v1/lists/:listId/details Get all lists shared with the user
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} userId The userId of the user should be passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List(s) Found Successfully.",
	    "status": 200,
	    "data": {
					"tasks": [
						"taskId1",
						"taskId2"
					],
					"notes": "String",
					"collaborators": [Array<string>],
					"isDone": Boolean,
					"listId": "String",
					"createdBy": "String",
					"title": "String",
					"createdOn": "Date",
					"lastModified": "Date"
        		}
	    }
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.",
	    "status": 500,
	    "data": null
	   }
	 */


	app.post(`${baseUrl}/create`, auth.isAuthorized, listController.createList);

    /**
	 * @api {post} /api/v1/lists/create Create new list
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the list passed as the body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List created Successfully",
	    "status": 200,
	    "data": []
	    	}
		}
	}
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */



	app.put(`${baseUrl}/:listId/edit`, auth.isAuthorized, listController.editList);

    /**
	 * @api {put} /api/v1/lists/:listId/edit Edit list by listId
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} title title of the list passed as the Body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List Edited Successfully.",
	    "status": 200,
	    "data": [
					"tasks": [
						"taskId1",
						"taskId2",
						...
					],
					"notes": "String",
					"collaborators": [Array<string>],
					"isDone": Boolean,
					"listId": "String",
					"createdBy": "String",
					"title": "String",
					"createdOn": "Date",
					"lastModified": "Date"
	    		]
		}
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */


	app.post(`${baseUrl}/:listId/delete`, auth.isAuthorized, listController.deleteList);

    /**
	 * @api {post} /api/v1/lists/delete Delete list by listId
	 * @apiVersion 0.0.1
	 * @apiGroup delete
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} listId listId of the list passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List Deleted Successfully",
	    "status": 200,
	    "data": []
	    	}
		}
	}
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */

}
// end module.exports.setRouter