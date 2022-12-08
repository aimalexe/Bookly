module.exports = function(handler){
    return async (exception, req, res, next) =>{
        try{
            handler(req, res);
        }
        catch{
            next(exception);
        }
    };
}