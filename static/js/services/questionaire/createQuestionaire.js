import { baseUrl, baseUrl_local } from "../../global"

export function createQuestionaire(data, extraParameters){
	return postRequest(baseUrl+"/v1/questionaire", {"content-type": "application/json"}, JSON.stringify(data), function(res, status, xhr){
		if(res.status && res.status =='success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("createdQuestionaire", res);
		}
	}, function(res,status,error) {
		return pubsub.publish("failedToCreateQuestionaire", res);
	});
}
