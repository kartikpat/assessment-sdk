function fetchQuestions(parameters){
	return getRequest(sdkbaseUrl+"/v1/question", parameters,function(res){
		if(res.status && res.status =='success'){
			return pubsub.publish("fetchedQuestions", res);
		}

	}, function(res,status,error) {
	    return pubsub.publish("failedToFetchQuestions", res);
	});
}
