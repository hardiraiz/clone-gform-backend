import mongoose from "mongoose";
import Form from "../models/Form.js";
import User from "../models/User.js";
import isEmailValid from '../libraries/isEmailValid.js';

class InviteController {
    
    async index(req, res) {
        try {
            if(!req.params.id) { 
                throw { code: 400, message: 'REQUIRED_FORM_ID' } };
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) { 
                throw { code: 400, message: 'INVALID_ID' } };
            
            const form = await Form.findOne({ _id: req.params.id, userId: req.jwt.id })
                                    .select('invites');
            if(!form) { throw { code: 404, message: 'INVITES_NOT_FOUND' } }
    
            return res.status(200)
                        .json({
                            status: true,
                            message: 'INVITE_FOUND',
                            form
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message,
            }); 
        }

    }

    async store(req, res) {
        try {
            if(!req.params.id) { 
                throw { code: 400, message: 'REQUIRED_FORM_ID' }};
            if(!req.body.email) { 
                throw { code: 400, message: 'REQUIRED_EMAIL' }};
            if (!isEmailValid(req.body.email)) {
                throw { code: 400, message: 'INVALID_EMAIL' }}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) { 
                throw { code: 400, message: 'INVALID_ID' }};
            
            // validation user cant invite himself
            const user = await User.findOne({ _id: req.jwt.id, email: req.body.email });
            if(user) { throw { code: 400, message: 'CANT_INVITE_YOURSELF' } };

            // check if email has been invited
            const emailInvited = await Form.findOne(
                                        { 
                                            _id: req.params.id, 
                                            userId: req.jwt.id,
                                            invites: { '$in': req.body.email }
                                        });
            if(emailInvited) { throw { code: 400, message: 'EMAIL_ALREADY_INVITED' } }

            // check email
            const regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
            if(!regex.test(req.body.email)) { 
                throw { code: 400, message: "INVALID_EMAIL" } };

            const form = await Form.findOneAndUpdate(
                                    { _id: req.params.id, userId: req.jwt.id },
                                    { $push: { invites: req.body.email } },
                                    { new: true });
            
            if(!form) { throw { code: 404, message: 'INVITES_FAILED' } }
    
            return res.status(200)
                        .json({
                            status: true,
                            message: 'INVITE_SUCCESS',
                            email: req.body.email
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message,
            }); 
        }

    }

    async destroy(req, res) {
        try {
            if(!req.params.id) { 
                throw { code: 400, message: 'REQUIRED_FORM_ID' } };
            if(!req.body.email) { 
                throw { code: 400, message: 'REQUIRED_EMAIL' } };
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) { 
                throw { code: 400, message: 'INVALID_ID' } };
            
            // check if email is exist
            const emailExist = await Form.findOne(
                { 
                    _id: req.params.id, 
                    userId: req.jwt.id,
                    invites: { '$in': req.body.email }
                });
            if(!emailExist) { throw { code: 404, message: 'EMAIL_NOT_FOUND' } }
            
            // remove user from invites
            const form = await Form.findOneAndUpdate(
                                    { _id: req.params.id, userId: req.jwt.id },
                                    { $pull: { invites: req.body.email } },
                                    { new: true });
            
            if(!form) { throw { code: 404, message: 'REMOVE_INVITE_FAILED' } }
    
            return res.status(200)
                        .json({
                            status: true,
                            message: 'REMOVE_INVITE_SUCCESS',
                            email: req.body.email
                        });

        } catch (error) {
            return res.status(error.code || 500).json({
                status: false,
                message: error.message,
            }); 
        }

    }

}

export default new InviteController();
