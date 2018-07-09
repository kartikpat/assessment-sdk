
/**
 * Wrapper for ajax post request
 * @param  {String} url             request url
 * @param  {object} headers         request headers
 * @param  {object} data            data to be sent
 * @param  {function} successCallback function to be executed on request success
 * @param  {function} failCallback    function to be executed on request fail
 * @param  {boolean} processData     set this to true when passing data as an object
 * @param  {boolean} async           set this to true when making synchronous request
 * @param  {object} scopeTest       reference object if any to be accessed in the callback
 */
var postRequest = function (url, headers, data, successCallback, failCallback, processData, async, scopeTest, contentType) {
    if (!headers) headers = {};

    // if(!headers["Authorization"]) {
    //     headers['Authorization'] = 'Bearer '+getCookie(cookieName);
    // }
    // debugger
    // if([baseUrl+"/recruiter/login/verify", baseUrl+"/recruiter/login", baseUrl+"/recruiter/register", baseUrl+"/recruiter/resend", baseUrl+"/recruiter/forgot-password",baseUrl+"/recruiter/reset"  ].indexOf(url) <0 && getCookie('IIMJOBS_CK1')!=getCookie('IIMJOBS_CK1_COPY')){
    //     debugger
    //     return window.location.reload();
    // }

    return $.ajax({
        method: "POST",
        url: url,
        headers: headers,
        data: data,
        scopeTest: scopeTest,
        processData: processData,
        success: successCallback,
        error: failCallback,
        async: async,
        contentType: contentType
    });
};

/**
 * Wrapper for ajax get request
 * @param  {String}   url                  request url
 * @param  {object}   parameters           request parameters
 * @param  {Function} callback             function to be invoked on request success
 * @param  {object}   additionalParameters reference object if any to be accessed in the callback
 */
var getRequest = function (url, parameters, successCallback, failCallback, additionalParameters, showError) {

    var headers = {};
    // headers = {
    //     'Authorization': 'Bearer '+getCookie(cookieName)
    // }

    // if([baseUrl+"/recruiter/login/verify", baseUrl+"/recruiter/login", baseUrl+"/recruiter/register", baseUrl+"/recruiter/resend", baseUrl+"/recruiter/forgot-password",baseUrl+"/recruiter/reset"  ].indexOf(url) <0 && getCookie('IIMJOBS_CK1')!=getCookie('IIMJOBS_CK1_COPY')){
    //     debugger
    //     return window.location.reload();
    // }

    return $.ajax({
        method: "GET",
        url: url,
        data: parameters,
        headers: headers,
        additionalParameters: additionalParameters,
        success: successCallback,
        error: failCallback

    });
};