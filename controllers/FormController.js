import mongoose from "mongoose";
import Form from "../models/Form.js";
import User from "../models/User.js";

class FormController {
    async index(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;

            // list forms dengan pagination
            const forms = await Form.paginate({ userId: req.jwt.id }, 
                                            { limit: limit, page: page });
            if(!forms) {
                throw { code: 404, message: 'FORMS_NOT_FOUND' }
            }

            return res.status(200)
                        .json({
                            status: true,
                            message: 'SUCCESS_GET_FORMS',
                            totalData: forms.docs.length,
                            forms
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
            const form = await Form.create({
                userId: req.jwt.id, // jwt id user dari headers
                title: 'Untitled Form',
                description: null,
                public: true
            });
            
            if(!form) {
                throw { code: 500, message: 'FAILED_CREATE_FORM' }
            }
    
            return res.status(200).json({
                status: true,
                message: 'SUCCESS_CREATE_FORM',
                form
            });
        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }

    async show(req, res) {
        try {
            if(!req.params.id) {
                throw { code: 400, message: 'REQUIRED_FORM_ID' }
            }
            // Check if id format is valid
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                throw { code: 400, message: 'INVALID_FORM_ID' }
            }

            // Find form by id and user id is match
            const form = await Form.findOne({ _id: req.params.id, userId: req.jwt.id });
            if(!form) {
                throw { code: 404, message: 'FORM_NOT_FOUND' }
            }

            return res.status(200)
                        .json({
                            status: true,
                            message: 'SUCCESS_GET_FORM',
                            form
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
                throw { code: 400, message: 'REQUIRED_FORM_ID' }
            }
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                throw { code: 400, message: 'INVALID_FORM_ID' }
            }

            // update and return updated form data
            const form = await Form.findOneAndUpdate({ _id: req.params.id, userId: req.jwt.id }, req.body, { new: true });
            if(!form) {
                throw { code: 404, message: 'FORM_UPDATE_FAILED ' }
            }

            return res.status(200)
                        .json({
                            status: true,
                            message: 'SUCCESS_UPDATE_FORM',
                            form
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
                throw { code: 400, message: 'REQUIRED_FORM_ID' }
            }
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                throw { code: 400, message: 'INVALID_FORM_ID' }
            }

            // delete and return deleted form data
            const form = await Form.findOneAndDelete({ _id: req.params.id, userId: req.jwt.id });
            if(!form) {
                throw { code: 404, message: 'FORM_DELETE_FAILED ' }
            }

            return res.status(200)
                        .json({
                            status: true,
                            message: 'SUCCESS_DELETE_FORM',
                            form
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message
            });
        }
    }

    async showToUser(req, res) {
        try {
            if(!req.params.id) {
                throw { code: 400, message: 'REQUIRED_FORM_ID' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                throw { code: 400, message: 'INVALID_FORM_ID' }}

            const form = await Form.findOne({ _id: req.params.id });
            if(!form) {
                throw { code: 404, message: 'FORM_NOT_FOUND' }}
            
            // check if user not the owner
            // check if user is invited and the form is private
            if(req.jwt.id != form.userId && form.public === false) {
                const user = await User.findOne({ _id: req.jwt.id });
                
                if(!form.invites.includes(user.email)) {
                    throw { code: 401, message: 'YOURE_NOT_INVITE' }
                }
            }

            form.invites = []
            return res.status(200)
                        .json({
                            status: true,
                            message: 'SUCCESS_GET_FORM',
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

export default new FormController();
