import { Response } from 'express';


export class ReturnHelper {
    static successResponseAny(
        res: Response,
        status_code: number,
        message: string,
        data: any = null
    ): Response {

        return res.status(status_code || 200).json({
            status: true,
            code: status_code || 200,
            message: message || "success",
            data: data || {},
        });
    };

    static successResponselist(
        res: Response,
        status_code: number,
        message: string,
        count_data: number = 0,
        current_page: number = 0,
        total_count_data: number = 0,
        list_data: any = null
    ): Response {

        return res.status(status_code || 200).json({
            status: true,
            code: status_code || 200,
            message: message || "success",
            data: {
                count: count_data,
                page: current_page,
                total_count: total_count_data,
                list: list_data
            },
        });
    };

    static errorResponse(
        res: Response,
        status_code: number,
        error_code: number,
        message: string,
        error: any = null
    ): Response {

        return res.status(status_code || 200).json({
            status: false,
            error_code: error_code || 400,
            message: message || "failed",
            error: error,
        });
    };
}