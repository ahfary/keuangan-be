import { ResponseSuccess } from "src/interface/response.interface";

class BaseResponse {
    success(msg: string, data?: any):ResponseSuccess{
        return {
            status: 'success',
            msg: msg,
            data: data || {},
        };
    }
}

export default BaseResponse