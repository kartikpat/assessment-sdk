export function fetchQuestionaire(parameters){
	return getRequest(sdkbaseUrl+"/v1/questionaire", parameters,function(res){
		if(res.status && res.status =='success'){
			return pubsub.publish("fetchedQuestionaire", res);
		}
	}, function(res,status,error) {
	    return pubsub.publish("failedToFetchQuestionaire", res);
	});
}
