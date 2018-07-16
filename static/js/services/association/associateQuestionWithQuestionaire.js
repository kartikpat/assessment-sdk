import { baseUrl, baseUrl_local } from "../../global"


export function associateQuestionWithQuestionaire(questionaireId, sectionId, data, extraParameters){
	return postRequest(baseUrl+"/v1/questionaire/"+questionaireId+"/section/"+sectionId+"/question", {"content-type": "application/json"}, JSON.stringify(data), function(res, status, xhr){
		if(res.status && res.status =='success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("associatedQuestionWithQuestionaire", res);
		}
	}, function(res,status,error) {
		return pubsub.publish("failedToAssociateQuestionWithQuestionaire", res);
	});
}
