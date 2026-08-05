import path from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

interface LanguageValue {
    success_insert?: string;
    success_update?: string;
    success_delete?: string;
    success_restore?: string;
    success_view?: string;
    success?: string;
    success_valid_otp?: string;
    success_logout?: string;

    failed?: string;
    failed_access?: string;
    failed_access_otp?: string;
    failed_expired_otp?: string;
    failed_access_pin?: string;
    failed_try_pin?: string;
    failed_insert?: string;
    failed_update?: string;
    failed_delete?: string;
    failed_restore?: string;
    failed_save?: string;
    failed_view?: string;
    failed_empty?: string;
    failed_data?: string;
    failed_duplicate?: string;
    failed_not_found?: string;
    failed_limit_otp?: string;
    failed_limit_link_code?: string;
    failed_expired_token?: string;
    failed_token?: string;
    failed_add_point?: string;
    failed_logout?: string;
    failed_related?: string;

    //login
    success_login?: string;
    failed_password?: string;
}

export class Language {
    static lang_init: Record<string, LanguageValue> = {};
    static lang: LanguageValue = {};

    static setup() {
        const fileLang: any = fs.readFileSync(
            path.join(__dirname, '../langs/json/en.json')
        );
        Language.lang_init['en'] = JSON.parse(fileLang.toString('utf8'));
    }

    static apply = (req: Request, res: Response, next: NextFunction) => {
        const acceptLanguageHeader = req.get('Accept-Language') as string | null;
        if (!acceptLanguageHeader) {
            //default
            req.params.language = 'en';
        } else {
            req.params.language = 'en';
            // req.params.language = acceptLanguageHeader.substring(0, 2).toLowerCase();
        }

        Language.lang = Language.lang_init[req.params.language] ? Language.lang_init[req.params.language] : Language.lang_init['en'];

        return next();
    }
}