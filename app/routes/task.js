const express = require('express');
const router = express.Router();
const taskController = require("./../../app/controllers/taskController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

	let baseUrl = `${appConfig.apiVersion}/tasks`;

	// defining routes.

	app.get(`${baseUrl}/all/:userId`, auth.isAuthorized, taskController.getAllTasks);

    /**
	 * @api {get} /api/v1/tasks/all:userId Get all tasks created by user
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} userId The userId should be passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
			  error: false, 
			  message: "All Task Details Found", 
			  status: 200, 
			  data: {
				assignees: [array]
				comments: [array]
				createdBy: "string"
				createdOn: "date"
				dueDate: "date"
				isDone: boolean
				isImportant: boolean
				lastModified: "date"
				listId: "string"
				notes: "string"
				reminder: Array
				subTask: [{
					assignees: [array]
					comments: [array]
					createdBy: "string"
					dueDate: "date"
					isDone: boolean
					title: "string"
					_id: "string
					},
					...
					]
				taskId: "string"
				title: "string"
				today: boolean
				_id: "string"
			  },
			  ...
			}

	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To Find Task Details",
	    "status": 500,
	    "data": null
	   }
	 */



	app.get(`${baseUrl}/list/:listId`, auth.isAuthorized, taskController.getListTasks);

    /**
	 * @api {get} /api/v1/tasks/view/all Get all tasks of the list
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} listId The listId should be passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    error: false, 
			  message: "List Tasks Found", 
			  status: 200, 
			  data: {
				assignees: [array]
				comments: [array]
				createdBy: "string"
				createdOn: "date"
				dueDate: "date"
				isDone: boolean
				isImportant: boolean
				lastModified: "date"
				listId: "string"
				notes: "string"
				reminder: Array
				subTask: [{
					assignees: [array]
					comments: [array]
					createdBy: "string"
					dueDate: "date"
					isDone: boolean
					title: "string"
					_id: "string
					},
					...
					]
				taskId: "string"
				title: "string"
				today: boolean
				_id: "string"
			  },
			  ...
	    }
	  @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To Find List Tasks",
	    "status": 500,
	    "data": null
	   }
	 */


	app.get(`${baseUrl}/:taskId/details`, auth.isAuthorized, taskController.getSingleTask);

    /**
	 * @api {get} /api/v1/tasks/:taskId/details Get a single task
	 * @apiVersion 0.0.1
	 * @apiGroup read
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId The taskId should be passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    error: false, 
		message: "Task Details Found", 
		status: 200, 
		data: {
			assignees: [array]
			comments: [array]
			createdBy: "string"
			createdOn: "date"
			dueDate: "date"
			isDone: boolean
			isImportant: boolean
			lastModified: "date"
			listId: "string"
			notes: "string"
			reminder: Array
			subTask: [{
				assignees: [array]
				comments: [array]
				createdBy: "string"
				dueDate: "date"
				isDone: boolean
				title: "string"
				_id: "string
				},
				...
				]
			taskId: "string"
			title: "string"
			today: boolean
			_id: "string"
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


	app.post(`${baseUrl}/create`, auth.isAuthorized, taskController.createTask);

    /**
	 * @api {post} /api/v1/tasks/create Create new task
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the task passed as the body parameter
     * @apiParam {Number} notes Notes of the task passed as the body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Task Created Successfully",
	    "status": 200,
	    "data": [...]
		}
	
	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */


	app.post(`${baseUrl}/subTask/create/:taskId`, auth.isAuthorized, taskController.createSubTask);

    /**
	 * @api {post} /api/v1/tasks/create Create new sub-task
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the task passed as the body parameter
     * @apiParam {Number} notes Notes of the task passed as the body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Sub-Task created Successfully",
	    "status": 200,
	    "data": [...]
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

	app.post(`${baseUrl}/comment/create/:taskId`, auth.isAuthorized, taskController.createTaskComment);

    /**
	 * @api {post} /api/v1/tasks/create Create new task comment
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the task passed as the body parameter
     * @apiParam {Number} notes Notes of the task passed as the body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
		error: false
		message: "Comment created."
		status: 200,
		data:[...]
		}

	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */


	app.post(`${baseUrl}/subTask/comment/create/:taskId`, auth.isAuthorized, taskController.createSubTaskComment);

    /**
	 * @api {post} /api/v1/tasks/create Create new sub-task comment
	 * @apiVersion 0.0.1
	 * @apiGroup create
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} createdBy userId of the creator passed as the body parameter
     * @apiParam {String} title Title of the task passed as the body parameter
     * @apiParam {Number} notes Notes of the task passed as the body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	  	error: false
		message: "Subtask Comment created."
		status: 200,
		data:[...]
		}

	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */



	app.put(`${baseUrl}/:taskId/edit`, auth.isAuthorized, taskController.editTask);

    /**
	 * @api {put} /api/v1/blogs/:taskId/edit Edit task by taskId
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Task Edited Successfully.",
	    "status": 200,
	    "data": [...]	
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

	app.put(`${baseUrl}/:taskId/:subTask_id/status`, auth.isAuthorized, taskController.setSubTaskStatus);

    /**
	 * @api {put} /api/v1/blogs/:taskId/edit Mark subtask done or undone
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} subTask_id subTask_id of the sub-task passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Subtask status marked Successfully.",
	    "status": 200,
	    "data": [...]
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

	app.put(`${baseUrl}/:taskId/edit/comment`, auth.isAuthorized, taskController.editComment);

    /**
	 * @api {put} /api/v1/blogs/:taskId/edit Edit task comment by commentId
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} comment_id comment_id of the comment passed as the Body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Comment Edited Successfully.",
	    "status": 200,
	    "data": [...]
		}

	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */


	 
	app.put(`${baseUrl}/:taskId/subTask/edit/comment`, auth.isAuthorized, taskController.editSubTaskComment);

    /**
	 * @api {put} /api/v1/blogs/:taskId/edit Edit subtask comment by comment_id
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} comment_id comment_id of the subrask passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "SubTask comment Edited Successfully.",
	    "status": 200,
	    "data": [...]
		}

	 * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured.,
	    "status": 500,
	    "data": null
	   }
	 */


	app.post(`${baseUrl}/:taskId/delete`, auth.isAuthorized, taskController.deleteTask);

    /**
	 * @api {post} /api/v1/tasks/delete Delete task by taskId
	 * @apiVersion 0.0.1
	 * @apiGroup delete
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Task Deleted Successfully",
	    "status": 200,
	    "data": [...]
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


	app.post(`${baseUrl}/:taskId/:subTask_id/delete`, auth.isAuthorized, taskController.deleteSubTask);

    /**
	 * @api {post} /api/v1/tasks/delete Delete subtask by taskId and subtask_id
	 * @apiVersion 0.0.1
	 * @apiGroup delete
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} subtask_id subtask_id of the subtask passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Sub Task Deleted Successfully",
	    "status": 200,
	    "data": [...]
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

	 
	app.post(`${baseUrl}/:taskId/commentDelete`, auth.isAuthorized, taskController.deleteComment);

    /**
	 * @api {post} /api/v1/tasks/delete Delete task coment by taskId and comment_id
	 * @apiVersion 0.0.1
	 * @apiGroup delete
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} comment_id comment_id of the comment passed as the Body parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Task Comment Deleted Successfully",
	    "status": 200,
	    "data": [...]
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

	app.post(`${baseUrl}/:taskId/subTask/comment/delete`, auth.isAuthorized, taskController.deleteSubTaskComment);

    /**
	 * @api {post} /api/v1/tasks/:taskId/subTask/comment/delete Delete subtask comment by taskId, subTaskId and comment_id
	 * @apiVersion 0.0.1
	 * @apiGroup delete
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 * @apiParam {String} taskId taskId of the task passed as the URL parameter
	 * @apiParam {String} subTaskId subTaskId of the sub task passed as the URL parameter
	 * @apiParam {String} comment_id comment_id of the subtask comment passed as the URL parameter
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Sub Task Comment Deleted Successfully",
	    "status": 200,
	    "data": [...]
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

	app.put(`${baseUrl}/undo`, taskController.undo);

    /**
	 * @api {post} /api/v1/tasks/undo Undo previous action performed by the user
	 * @apiVersion 0.0.1
	 * @apiGroup update
	 *
	 * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
	 *
	 *  @apiSuccessExample {json} Success-Response:
	 *  {
	    "error": false,
	    "message": "Undo Successfully",
	    "status": 200,
	    "data": [...]
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