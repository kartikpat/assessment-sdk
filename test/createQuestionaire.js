function createQuestionaire(data, extraParameters) {
	return postRequest(sdkbaseUrl + "/v1/questionaire", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
		if (res.status && res.status == 'success') {
			res.extraParameters = {};
			res.extraParameters["questionData"] = extraParameters.questionData;
			return pubsub.publish("createdQuestionaire", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToCreateQuestionaire", res);
	});
}