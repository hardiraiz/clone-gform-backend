import mongoose from "mongoose";
import Form from "../models/Form.js";

const allowedTypes = ['Text', 'Radio', 'Checkbox', 'Dropdown', 'Email'];

function modifyAttributeNames(data) {
    if (Array.isArray(data)) {
        return data.map(item => modifyAttributeNames(item));
    } else if (typeof data === 'object' && data !== null) {
        const modifiedData = {};
        for (let key in data) {
            if (key === 'id' && Array.isArray(data[key])) {
                modifiedData._id = modifyAttributeNames(data[key]);
            } else if (key === 'type' && Array.isArray(data[key])) {
                modifiedData._type = modifyAttributeNames(data[key]);
            } else if (key === 'id') {
                modifiedData._id = data[key];
            } else if (key === 'type') {
                modifiedData._type = data[key];
            } else {
                modifiedData[key] = modifyAttributeNames(data[key]);
            }
        }
        return modifiedData;
    } else {
        return data;
    }
}

class QuestionController {
    async index(req, res){
        try {
            const form = await Form.findOne({ _id: req.params.id, userId: req.jwt.id });
            if(!form) { throw { code: 404, message: 'FORM_NOT_FOUND' } }

            const modifiedQuestions = modifyAttributeNames(form.questions);

            return res.status(200)
                        .json({
                            status: true,
                            message: 'FORM_FOUND',
                            questions: modifiedQuestions
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }

    async store(req, res) {
        try {
            if(!req.params.id) {
                throw { code: 400, message: 'REQUIRED_FORM_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw { code: 400, message: 'INVALID_FORM_ID' }}

            const newQuestion = {
                id: mongoose.Types.ObjectId(),
                question: null,
                type: 'Text', // text, radio, checbox, dropdown
                required: false,
                options: [] // option if radio, checkbox, or dropdown
            }

            // add question in form
            const form = await Form.findOneAndUpdate(
                { _id: req.params.id, userId: req.jwt.id},
                { $push: { questions: newQuestion } },
                { new: true });
            
            if(!form) {
                throw { code: 400, message: 'UPDATE_QUESTION_FAILED' }
            }

            return res.status(200)
                        .json({
                            status: true,
                            message: 'ADD_QUESTION_SUCCESS',
                            question: newQuestion
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }

    async update(req, res) {
        try {
            if(!req.params.id) {
                throw { code: 400, message: 'REQUIRED_FORM_ID' }}
            if(!req.params.questionId) {
                throw { code: 400, message: 'REQUIRED_QUESTION_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw { code: 400, message: 'INVALID_FORM_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
                throw { code: 400, message: 'INVALID_QUESTION_ID' }}
            
            
            // Dynamic update attribute
            let field = {};
            if(req.body.hasOwnProperty('question')) {
                field['questions.$[indexQuestion].question'] = req.body.question;
            } 
            if(req.body.hasOwnProperty('required')) {
                field['questions.$[indexQuestion].required'] = req.body.required;
            } 
            if(req.body.hasOwnProperty('type')) {
                // check allowed types to record
                if(!allowedTypes.includes(req.body.type)) {
                    throw { code: 400, message: 'INVALID_QUESTION_TYPE' }}
                
                    field['questions.$[indexQuestion].type'] = req.body.type;
            }

            // update data question in form
            const question = await Form.findOneAndUpdate(
                    { _id: req.params.id, userId: req.jwt.id },
                    { $set: field },
                    {
                        arrayFilters: [{ 'indexQuestion.id': mongoose.Types.ObjectId(req.params.questionId) }],
                        new: true 
                    });
            
            if(!question) { 
                throw { code: 400, message: 'QUESTION_UPDATE_FAILED' }}

            return res.status(200)
                        .json({
                            status: true,
                            message: 'QUESTION_UPDATE_SUCCESS',
                            question: question.questions
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }

    async destroy(req, res) {
        try {
            if(!req.params.id) {
                throw { code: 400, message: 'REQUIRED_FORM_ID' }}
            if(!req.params.questionId) {
                throw { code: 400, message: 'REQUIRED_QUESTION_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw { code: 400, message: 'INVALID_FORM_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.questionId)) {
                throw { code: 400, message: 'INVALID_QUESTION_ID' }}

            // delete question in form
            const form = await Form.findOneAndUpdate(
                { _id: req.params.id, userId: req.jwt.id},
                { $pull: { 
                    questions: { id: mongoose.Types.ObjectId(req.params.questionId) }
                }}, { new: true });
            
            if(!form) {
                throw { code: 400, message: 'DELETE_QUESTION_FAILED' }}

            return res.status(200)
                        .json({
                            status: true,
                            message: 'DELETE_QUESTION_SUCCESS',
                            form
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }
}

export default new QuestionController();
