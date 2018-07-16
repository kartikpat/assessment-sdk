import { baseUrl, baseUrl_local } from "../../global"

export function fetchQuestions(parameters){
	return getRequest(baseUrl+"/v1/question", parameters,function(res){
		if(res.status && res.status =='success'){
			return pubsub.publish("fetchedQuestions", res);
		}
	}, function(res,status,error) {
	    return pubsub.publish("failedToFetchQuestions", res);
	});
}
