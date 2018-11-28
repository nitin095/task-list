const express = require('express');
const router = express.Router();
const listController = require("./../../app/controllers/listController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const googleAuth = require("./../libs/googleAuth")

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/lists`;

    // defining routes.

    app.get(`${baseUrl}/all`, listController.getAllLists);

    /**
	 * @api {get} /api/v1/lists/view/all Get all lists
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "All List Details Found",
	    "status": 200,
	    "data": [
					{
						listId: "string",
						firstName: "string",
						lastName: "string",
                        email: "string",
                        countryCode: number,
						moile: number,
						lastModified: "date"
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


    app.get(`${baseUrl}/:listId/details`, listController.getSingleList);

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
            listId: "string",
            firstName: "string",
            lastName: "string",
            email: "mstring",
            countryCode: number,
            mobileNumber: number,
            createdOn: "Date",
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


    app.post(`${baseUrl}/create`, listController.createList);

    /**
	 * @api {post} /api/v1/lists/create Create new list
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the list passed as the body parameter
     * @apiParam {Number} notes Notes of the list passed as the body parameter
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



    app.put(`${baseUrl}/:listId/edit`, listController.editList);

    /**
	 * @api {put} /api/v1/blogs/:listId/edit Edit list by listId
	 * @apiVersion 0.0.1
	 * @apiGroup edit
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} listId listId of the list passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "List Edited Successfully.",
	    "status": 200,
	    "data": [
					{
						listId: "string",
						firstName: "string",
						lastName: "string",
                        email: "string",
                        countryCode: number,
						moile: number,
						lastModified: "date"
					}
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


    app.post(`${baseUrl}/:listId/delete`, listController.deleteList);

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