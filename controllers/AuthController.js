import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/User.js';
import emailExist from '../libraries/emailExist.js';
import isEmailValid from '../libraries/isEmailValid.js';


const env = dotenv.config().parsed;

const genereateAccessToken = async (payload) => {
    return jsonwebtoken.sign(payload,
            env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION_TIME });
}

const genereateRefreshToken = async (payload) => {
    return jsonwebtoken.sign(payload,
            env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION_TIME });
}

class AuthController {
    async register(req, res){
        try {
            if (!req.body.fullname) {
                throw { code: 400, message: 'FULLNAME_IS_REQUIRED' }}
            if (!req.body.email) {
                throw { code: 400, message: 'EMAIL_IS_REQUIRED' }}
            if (!isEmailValid(req.body.email)) {
                throw { code: 400, message: 'INVALID_EMAIL' }}
            if (!req.body.password) {
                throw { code: 400, message: 'PASSWORD_IS_REQUIRED' }}
            if (req.body.password.length < 6) {
                throw { code: 400, message: 'PASSWOR_MINIMUM_6_CHARACTERS' }}

            const isEmailExist = await emailExist(req.body.email);
            if (isEmailExist) {
                throw { code: 409, message: 'EMAIL_ALREADY_EXIST' }}

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.password, salt);

            const user = await User.create({
                fullname: req.body.fullname,
                email: req.body.email,
                password: hash,
            });

            if (!user) {
                throw { code: 500, message: 'USER_REGISTER_FAILED' }}
            
            // generate token
            let payload = { id: user._id };
            const accessToken = await genereateAccessToken(payload);
            const refreshToken = await genereateRefreshToken(payload);

            return res.status(201)
                .json({
                    status: true,
                    message: 'USER_REGISTER_SUCCESS',
                    fullname: user.fullname,
                    accessToken,
                    refreshToken
                });

        } catch (error) {
            return res.status(error.code || 500)
                .json({ 
                    status: false,
                    message: error.message });
        }
    }

    async login(req, res) {
        try {
            if (!req.body.email) {
                throw { code: 400, message: 'EMAIL_IS_REQUIRED' }
            }
            if (!req.body.password) {
                throw { code: 400, message: 'PASSWORD_IS_REQUIRED' }
            }

            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                throw { code: 404, message: 'USER_NOT_FOUND' }
            }

            const isPasswordValid = await bcrypt.compareSync(req.body.password, user.password);
            if(!isPasswordValid) {
                throw { code: 400, message: 'INVALID_PASSWORD' }
            }
            
            let payload = { id: user._id };
            const accessToken = await genereateAccessToken(payload);
            const refreshToken = await genereateRefreshToken(payload);

            return res.status(200)
                .json({
                    status: true,
                    message: 'USER_LOGIN_SUCCESS',
                    fullname: user.fullname,
                    accessToken,
                    refreshToken
                });

        } catch (error) {
            return res.status(error.code || 500)
                .json({
                    status: false,
                    message: error.message
                });
        }
    }

    async refreshToken(req, res) {
        try {
            if (!req.body.refreshToken){ 
                throw { code: 400, message: 'REFRESH_TOKEN_IS_REQUIRED' } }
            
            // verify refresh token
            const verifyToken = await jsonwebtoken.verify(req.body.refreshToken, 
                                            env.JWT_REFRESH_TOKEN_SECRET);
            
            let payload = { id: verifyToken.id }
            const accessToken = await genereateAccessToken(payload);
            const refreshToken = await genereateRefreshToken(payload);
            
            return res.status(200)
                    .json({
                        status: true,
                        message: 'REFRESH_TOKEN_SUCCESS',
                        accessToken,
                        refreshToken
                    });

        } catch (error) {
            // change error message
            const errorJwt = ['invalid signature', 'jwt malformed', 
                            'jwt must be provided', 'invalid token'];
            if (error.message == 'jwt expired') {
                error.message = 'REFRESH_TOKEN_EXPIRED'
            } else if (errorJwt.includes(error.message)) {
                error.message = 'INVALID_REFRESH_TOKEN'
            }

            return res.status(error.code || 500)
                .json({
                    status: false,
                    message: error.message
                });
        }
    } 
}

export default new AuthController();
