import { baseUrl, baseUrl_local } from "../../global"

export function fetchQuestionaire(parameters){
	return getRequest(baseUrl+"/v1/questionaire", parameters,function(res){
		if(res.status && res.status =='success'){
			return pubsub.publish("fetchedQuestionaire", res);
		}
	}, function(res,status,error) {
	    return pubsub.publish("failedToFetchQuestionaire", res);
	});
}
