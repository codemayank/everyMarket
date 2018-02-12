
exports.generateResponse = function(error, message, status, data){

  let appResponse = {
    error : error,
    message : message,
    status : status,
    data : data
  };

  return appResponse;
}
