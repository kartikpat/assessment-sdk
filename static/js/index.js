import * as model from './model';
import {extendDefaults} from './utilities/common'
import { globalParameters, baseUrl, baseUrl_local, questionaireInvocation } from "./global"
import {associateQuestionWithQuestionaire} from './services/association/associateQuestionWithQuestionaire';
import {createQuestion} from './services/question/createQuestion';
import {fetchQuestions} from './services/question/fetchQuestions';
import {createQuestionaire} from './services/questionaire/createQuestionaire';
import {fetchQuestionaire} from './services/questionaire/fetchQuestionaire';

export default function Assessment(config) {
    var options = {}
    // Define option defaults
    var defaults = {
        title: 'Screening Questions',
        subTitle: 'You can ask some questions before the candidates apply to your job!'
    }

    // Create options by extending defaults with the passed in arugments
    if (config && typeof config === "object") {
        options = extendDefaults(defaults, config);
    }

    var questionsParameters = {
        "author": options.author
    }

    if(!options.association) {
        $.when(null, fetchQuestions(questionsParameters)).then(function(a, b) {
            if (b[0] && b[0]["status"] == "success") {

                var questionRows = b[0]['data'];

                var data = {
                    "prevQuestions": questionRows,
                    "options": options
                }
                return pubsub.publish("fetchedQuestionaireDetails", data);
            }

        }, function(res, status, error) {
            return pubsub.publish("failedToFetchQuestionaireDetails", res);
        });
        return
    }

    var questionaireParameters = {
        "association": options.association,
        "invocation": questionaireInvocation["screening"]
    }

    $.when(fetchQuestionaire(questionaireParameters), fetchQuestions(questionsParameters)).then(function(a, b) {
        if (a[0] && b[0] && a[0]["status"] == "success" && b[0]["status"] == "success") {

            var questionaireRows = a[0]['data'];
            var questionRows = b[0]['data'];

            var data = {
                "questionaire": questionaireRows,
                "prevQuestions": questionRows,
                "options": options
            }
            return pubsub.publish("fetchedQuestionaireDetails", data);
        }

    }, function(res, status, error) {
        return pubsub.publish("failedToFetchQuestionaireDetails", res);
    });
}

function onSuccessfullFetchedQuestionaireDetails(topic, data) {
    if(data.options) {
        globalParameters.options = data.options;
    }

    if(data.questionaire && data.questionaire.length) {
        globalParameters.questionaireId = data.questionaire[0]["id"]
        data.questionaire[0]["sections"][0]["questions"].forEach(function(aQuestion){
            globalParameters.questionIds.push(aQuestion["id"]);
        })
    }

    if(data.prevQuestions.length) {
        var prevQuestions = []
        data.prevQuestions.forEach(function(aPrevQuestion) {
            var index = globalParameters["questionIds"].indexOf(aPrevQuestion["id"]);
            if (index == -1) {
                prevQuestions.push(aPrevQuestion)
                globalParameters.prevQuestions[aPrevQuestion["id"]] = aPrevQuestion;
            }
        })
        data.prevQuestions = prevQuestions
    }

    model.initialize(data)

    model.setSortableList(function(questionIds) {
        var data = {}
        data["questionIds"] = questionIds;

        var extraParameters = {}
        extraParameters.questionIds = questionIds
        extraParameters.origin = "sortable";
        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters)
    })

    model.onClickUsePrevButtonModal(function(prevQuestionIds) {
        var data = {}
        data["questionIds"] = globalParameters.questionIds.concat(prevQuestionIds)

        var extraParameters = {}
        extraParameters.prevQuestionIds = prevQuestionIds
        extraParameters.origin = "prevUsed";
        extraParameters.data = data;

        if(!globalParameters.questionaireId) {
            var questionaireData = {
                "author": globalParameters.options.author,
                "tags": globalParameters.options.tags,
                "authorType": globalParameters.options.authorType,
                "invocation": questionaireInvocation["screening"],
                "association": globalParameters.options.association,
                "sections": [
                    {
                        "type": "static",
                        "questionIds": []
                    }
                ]
            };
            return createQuestionaire(questionaireData, extraParameters)
        }

        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters)
    })

    model.onClickAddQuestion(function(questionData) {
        var extraParameters = {}
        extraParameters.questionData = questionData;

        if(!globalParameters.questionaireId) {
            var questionaireData = {
                "author": globalParameters.options.author,
                "tags": globalParameters.options.tags,
                "authorType": globalParameters.options.authorType,
                "invocation": questionaireInvocation["screening"],
                "association": globalParameters.options.association,
                "sections": [
                    {
                        "type": "static",
                        "questionIds": []
                    }
                ]
            };
            return createQuestionaire(questionaireData, extraParameters)
        }

        createQuestion(questionData, extraParameters)
    })

    model.onClickDeleteQuestion(function(id){
        var data = {}
        data["questionIds"] = globalParameters.questionIds;
        var index = data["questionIds"].indexOf(id);
        if (index !== -1) {
            data["questionIds"].splice(index, 1);
        }
        var extraParameters = {}
        extraParameters.origin = "delete"
        extraParameters.questionId = id;
        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters)
    })

    model.onClickEditQuestionModal(function(id){
        return
    })
}

function onFailFetchedQuestionaireDetails(topic, data) {}

var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails)
var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails)

function onSuccessfullCreateQuestionaire(topic, res) {
    globalParameters.questionaireId = res.data;
    var extraParameters = {}
    if(res.extraParameters.origin == "prevUsed") {
        var data = res.extraParameters.data;
        extraParameters.prevQuestionIds = res.extraParameters.prevQuestionIds
        extraParameters.origin = "prevUsed";
        return associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters)
    }

    extraParameters.questionData = res.extraParameters.questionData;
    createQuestion(res.extraParameters.questionData, extraParameters)
}

function onFailCreateQuestionaire(topic, data) {}

var createdQuestionaireSuccessSubscription = pubsub.subscribe("createdQuestionaire", onSuccessfullCreateQuestionaire)
var createdQuestionaireFailSubscription = pubsub.subscribe("failedToCreateQuestionaire", onFailCreateQuestionaire)

function onSuccessfullCreateQuestion(topic, res) {
    var data = {}
    data["questionIds"] = globalParameters.questionIds.concat(res.data)
    var extraParameters = {}

    extraParameters.questionData = res.extraParameters.questionData;
    extraParameters.questionData["id"] = res.data;
    extraParameters.questionId = res.data;
    extraParameters.origin = "newlyAdded";
    associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters)
}

function onFailCreateQuestion(topic, data) {}

var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion)
var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion)

function onSuccessfullAssociateQuestionWithQuestionaire(topic, res) {

    if(res.extraParameters.origin == "delete") {
        var index = globalParameters.questionIds.indexOf(res.extraParameters.questionId);
        if (index !== -1) {
            globalParameters.questionIds.splice(index, 1);
        }
        if(globalParameters.questionIds.length < 10) {
            model.showActionButtonContainer()
        }
        if(globalParameters.questionIds.length == 0) {
            model.hideAddedQuestionContainer()
        }
        model.updateTotalQuestionsAddedText(globalParameters.questionIds.length)
        return model.deleteAddedQuestionRow(res.extraParameters.questionId)
    }

    if(res.extraParameters.origin == "sortable") {
        return alert("successfully sorted")
    }

    var questionsToAppend = []
    if(res.extraParameters.origin == "prevUsed") {
        globalParameters.questionIds = globalParameters.questionIds.concat(res.extraParameters.prevQuestionIds)
        res.extraParameters.prevQuestionIds.forEach(function(aPrevQuestionId){
            questionsToAppend.push(globalParameters.prevQuestions[aPrevQuestionId])
            model.deletePrevUsedQuestionRow(aPrevQuestionId)
            delete globalParameters.prevQuestions[aPrevQuestionId];
        })

        if(Object.keys(globalParameters.prevQuestions).length === 0 && globalParameters.prevQuestions.constructor === Object) {
            model.hideUsePrevButton()
        }

    }
    if(res.extraParameters.origin == "newlyAdded") {
        globalParameters.questionIds = globalParameters.questionIds.concat(res.extraParameters.questionId)
        questionsToAppend.push(res.extraParameters.questionData)
    }

    model.updateTotalQuestionsAddedText(globalParameters.questionIds.length)
    model.appendQuestionsAdded(questionsToAppend)
    if(globalParameters.questionIds.length >= 10) {
        model.hideActionButtonContainer()
    }
    model.closeContainer()
}

function onFailAssociateQuestionWithQuestionaire(topic, data) {}

var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire)
var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire)
