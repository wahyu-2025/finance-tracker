import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { ReturnHelper } from "../helpers/express/return";
import { User } from "../entities/index";
import { Language } from "../langs/lang";
import { ILogObj, Logger } from "tslog";
import JwtHelper, { IJwtPayload } from "../helpers/jwt";
import { OrmHelper } from "../helpers/orm";


const log: Logger<ILogObj> = new Logger({ name: '[AuthController]', type: 'pretty' });

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<Response> {
    /*
        #swagger.tags = ['Service Auth']
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/RegisterRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().min(6).required().label('Password'),
        fullname: Joi.string().max(128).required().label('Full Name'),
      });

      const param = await schema.validateAsync(req.body);

      const userRepository = OrmHelper.DB.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email: param.email } });

      if (existingUser) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed ?? ''), "Email already exists.");
      }

      const hashedPassword = bcrypt.hashSync(param.password, 10);

      const data = new User()
      data.email = param.email
      data.password = hashedPassword
      data.name = param.fullname

      await userRepository.save(data);

      return ReturnHelper.successResponseAny(res, 201, String(Language.lang.success_insert ?? ""), data);
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed_insert ?? ""), err.message);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<Response> {
     /*
        #swagger.tags = ['Service Auth']
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/LoginRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().required().label('Password'),
      });

      const param = await schema.validateAsync(req.body);

      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { email: param.email } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Invalid email or password.");
      }

      const isValidPassword = bcrypt.compareSync(param.password, user.password);
      if (!isValidPassword) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Invalid email or password.");
      }

      let payload: IJwtPayload = {
        id: user.id,
        name: user.name,  // Sesuaikan nama kolom
        email: user.email
      };

      let payloadRefreshToken: IJwtPayload = {
        id: user.id
      };

      const access_token = JwtHelper.signToken(payload, '15m');
      const refresh_token = JwtHelper.signToken(payloadRefreshToken, '1h');

      let token = {
        access_token,
        refresh_token
      };

      let data = {
        token,
        ...payload
      }

      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success), data);
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed), err.message);
    }
  }


  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response> {
    /*
        #swagger.tags = ['Service Auth']
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/ForgotPasswordRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        email: Joi.string().email().required().label('Email'),
      });

      const param = await schema.validateAsync(req.body);

      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { email: param.email } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Email not found.");
      }

      let payload: IJwtPayload = {
        id: user.id,
        email: user.email
      };
      console.log("PAYLOAD:", payload)

      const resetToken = JwtHelper.signToken(payload, '15m');

      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success), { resetToken });
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed), err.message);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response> {
    /*
        #swagger.tags = ['Service Auth']
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/ChangePasswordRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        token: Joi.string().required().label('Reset Token'),
        newPassword: Joi.string().min(6).required().label('New Password'),
      });

      const param = await schema.validateAsync(req.body);

      const decoded = JwtHelper.verifyToken(param.token);

      if (!decoded || !decoded.id) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Invalid or expired token.");
      }

      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "User not found.");
      }

      const hashedPassword = bcrypt.hashSync(param.newPassword, 10);
      user.password = hashedPassword;

      await userRepository.save(user);

      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success_update), {});
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed_update), err.message);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    /*
        #swagger.tags = ['Service Auth - Private']
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/UpdateRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        fullname: Joi.string().max(128).required().label('Full Name'),
        email: Joi.string().email().required().label('Email'),
      });

      const param = await schema.validateAsync(req.body);

      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req?.auth?.id } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 404, 401, String(Language.lang.failed), "User not found.");
      }

      user.name = param.fullname;
      user.email = param.email;

      await userRepository.save(user);

      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success_update), user);
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed_update), err.message);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
      /*
        #swagger.tags = ['Service Auth - Private']
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
    try {
      const userId = req?.auth?.id
      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 404, 401, String(Language.lang.failed), "User not found.");
      }

      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success_view), user);
    } catch (e) {
      log.error(e);
      const err = e as Error;
      return ReturnHelper.errorResponse(res, 500, 401, String(Language.lang.failed_view), err.message);
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<Response> {
    /*
        #swagger.tags = ['Service Auth']
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                         $ref: "#/components/schemas/RefreshTokenRequest"
                    }  
                }
            }
        }
        */
    try {
      const schema = Joi.object().keys({
        refresh_token: Joi.string().required().label('refresh_token'),
      });

      const param = await schema.validateAsync(req.body);

      const decoded = JwtHelper.verifyToken(param.refresh_token);

      if (!decoded || !decoded.id) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Invalid or expired refresh token");
      }

      const userRepository = OrmHelper.DB.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "User Not Found");
      }

      let payload: IJwtPayload = {
        id: user.id,
        name: user.name, 
        email: user.email
      };
      const access_token = JwtHelper.signToken(payload, '15m');
    
      let data = {
        access_token
      }
      return ReturnHelper.successResponseAny(res, 200, String(Language.lang.success), data);
    } catch (e) {
      return ReturnHelper.errorResponse(res, 400, 401, String(Language.lang.failed), "Invalid or expired refresh token");
    }
  }

}
