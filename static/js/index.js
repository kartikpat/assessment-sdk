import * as model from './model';
import {extendDefaults, closeContainer} from './utilities/common'

import { questionaireInvocation, baseUrl} from './global'
import {associateQuestionWithQuestionaire} from './services/association/associateQuestionWithQuestionaire';
import {createQuestion} from './services/question/createQuestion';
import {fetchQuestions} from './services/question/fetchQuestions';
import {createQuestionaire} from './services/questionaire/createQuestionaire';
import {fetchQuestionaire} from './services/questionaire/fetchQuestionaire';

var globalParameters = {
    questionaireId: null,
    questions: {}
}

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

    var questionaireParameters = {
        "association": options.association,
        "invocation": questionaireInvocation["screening"]
    }

    var questionsParameters = {
        "author": options.author
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
    if(data.questionaire.length) {
        globalParameters.questionaireId = data.questionaire[0]["id"]
        data.questionaire[0]["sections"][0]["questions"].forEach(function(aQuestion){
            globalParameters.questions[aQuestion["id"]] = aQuestion
        })
    }

    model.initialize(data)

    // model.onClick

    model.onClickUsePrevButtonModal(function() {
        console.log("hi")
    })

    model.onClickAddQuestion(function(questionData) {
        if(!globalParameters.questionaireId) {
            var questionaireData = {
                "author": data.options.author,
                "tags": data.options.tags,
                "authorType": data.options.authorType,
                "invocation": questionaireInvocation["screening"],
                "association": data.options.association,
                "sections": [
                    {
                        "type": "static",
                        "questionIds": []
                    }
                ]
            };
            var extraParameters = {}
            extraParameters.questionData = questionData
            return createQuestionaire(questionaireData, extraParameters)
        }

        var extraParameters = {}
        extraParameters.questionaireId = globalParameters.questionaireId;
        extraParameters.questionData = questionData;
        createQuestion(questionData, extraParameters)
    })
}

function onFailFetchedQuestionaireDetails(topic, data) {}

var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails)
var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails)

function onSuccessfullCreateQuestionaire(topic, res) {
    var extraParameters = {}
    extraParameters.questionaireId = res.data;
    extraParameters.questionData = res.extraParameters.questionData;
    createQuestion(res.extraParameters.questionData, extraParameters)
}

function onFailCreateQuestionaire(topic, data) {}

var createdQuestionaireSuccessSubscription = pubsub.subscribe("createdQuestionaire", onSuccessfullCreateQuestionaire)
var createdQuestionaireFailSubscription = pubsub.subscribe("failedToCreateQuestionaire", onFailCreateQuestionaire)

function onSuccessfullCreateQuestion(topic, res) {
    globalParameters.questions[res.data] = res.extraParameters.questionData;
    var data = {}
    data["questionIds"] = Object.keys(globalParameters.questions);
    associateQuestionWithQuestionaire(res.extraParameters.questionaireId, 0, data, {})
}

function onFailCreateQuestion(topic, data) {}

var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion)
var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion)

function onSuccessfullAssociateQuestionWithQuestionaire(topic, res) {
    closeContainer()
    alert(res.message)
}

function onFailAssociateQuestionWithQuestionaire(topic, data) {}

var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire)
var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire)
