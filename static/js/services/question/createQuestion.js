import { baseUrl, baseUrl_local } from "../../global"

export function createQuestion(data, extraParameters){
	return postRequest(baseUrl+"/v1/question", {"content-type": "application/json"}, JSON.stringify(data), function(res, status, xhr){
		if(res.status && res.status =='success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("createdQuestion", res);
		}
	}, function(res,status,error) {
		return pubsub.publish("failedToCreateQuestion", res);
	});
}
