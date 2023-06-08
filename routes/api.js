import express from 'express';
import jwtAuth from '../middlewares/jwtAuth.js';
import AuthController from "../controllers/AuthController.js";
import FormController from '../controllers/FormController.js';
import QuestionController from '../controllers/QuestionController.js';
import OptionController from '../controllers/OptionController.js';
import AnswerController from '../controllers/AnswerController.js';
import InviteController from '../controllers/InviteController.js';
import ResponseController from '../controllers/ResponseController.js';


const route = express();

// Auth
route.post('/register', AuthController.register);
route.post('/login', AuthController.login);
route.post('/refresh-token', AuthController.refreshToken);

// Form
route.get('/forms', jwtAuth(), FormController.index);
route.post('/forms', jwtAuth(), FormController.store);
route.get('/forms/:id', jwtAuth(), FormController.show);
route.put('/forms/:id', jwtAuth(), FormController.update);
route.delete('/forms/:id', jwtAuth(), FormController.destroy);
route.get('/forms/:id/users', jwtAuth(), FormController.showToUser);

// Quenstion
route.get('/forms/:id/questions', jwtAuth(), QuestionController.index);
route.post('/forms/:id/questions', jwtAuth(), QuestionController.store);
route.put('/forms/:id/questions/:questionId', jwtAuth(), QuestionController.update);
route.delete('/forms/:id/questions/:questionId', jwtAuth(), QuestionController.destroy);

// Option
route.post('/forms/:id/questions/:questionId/options', jwtAuth(), OptionController.store);
route.put('/forms/:id/questions/:questionId/options/:optionId', jwtAuth(), OptionController.update);
route.delete('/forms/:id/questions/:questionId/options/:optionId', jwtAuth(), OptionController.destroy);

// Invite
route.get('/forms/:id/invites', jwtAuth(), InviteController.index);
route.post('/forms/:id/invites', jwtAuth(), InviteController.store);
route.delete('/forms/:id/invites', jwtAuth(), InviteController.destroy);

// Answer
route.post('/answers/:formId', jwtAuth(), AnswerController.store);

// Response
route.get('/responses/:formId/lists', jwtAuth(), ResponseController.lists);
route.get('/responses/:formId/summaries', jwtAuth(), ResponseController.summaries);


export default route;
