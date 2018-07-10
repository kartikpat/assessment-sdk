
import * as model from './model';
import {associateQuestionWithQuestionaire} from './services/association/associateQuestionWithQuestionaire';
import {createQuestion} from './services/question/createQuestion';
import {fetchQuestions} from './services/question/fetchQuestions';
import {createQuestionaire} from './services/questionaire/createQuestionaire';
import {fetchQuestionaire} from './services/questionaire/fetchQuestionaire';

export default class Assessment {
    constructor(options) {
        this.title = options.title || 'Screening Questions';
        this.subTitle = options.subTitle || 'You can ask some questions before the candidates apply to your job!';
        this.author = options.author || Error('I was created using a function call!');
        this.association = options.association || Error('I was created using a function call!');

        return

        var questionaireParameters = {
            "association": options.association,
            "invocation": questionaireInvocation["screening"]
        }

        var questionsParameters = {
            "author": options.author
        }

        $.when(fetchQuestionaire(questionaireParameters), fetchQuestions(questionsParameters)).then(function(a, b) {
            if (a[0] && b[0] && a[0]["status"] == "success" && b[0]["status"] == "success") {

                let questionaireRows = a[0]['data'];
                let questionRows = b[0]['data'];

                let data = {
                    "questionaire": questionaireRows,
                    "questions": questionRows
                }

                return pubsub.publish("fetchedQuestionaireDetails", data);
            }

        }, function(res, status, error) {
            return pubsub.publish("failedToFetchQuestionaireDetails", res);
        });

        function onSuccessfullCreateQuestionaire(topic, res){
            var extraParameters = {}
            extraParameters.questionaireId = res.data;
            extraParameters.questionData = res.extraParameters.questionData;
            createQuestion(res.extraParameters.questionData, extraParameters)
        }

        function onFailCreateQuestionaire(topic, data) {

        }

        var createdQuestionaireSuccessSubscription = pubsub.subscribe("createdQuestionaire", onSuccessfullCreateQuestionaire)
        var createdQuestionaireFailSubscription = pubsub.subscribe("failedToCreateQuestionaire", onFailCreateQuestionaire)

        function onSuccessfullCreateQuestion(topic, res){
            questions[res.data] = res.extraParameters.questionData;
            var data = {}
            data["questions"] = Object.keys(questions);
            associateQuestionWithQuestionaire(res.extraParameters.questionaireId,0, data, {})
        }

        function onFailCreateQuestion(topic, data) {

        }

        var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion)
        var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion)

        function onSuccessfullAssociateQuestionWithQuestionaire(topic, res){
            alert(res.message)
            // questionIds.push(res.data);
            // associateQuestionWithQuestionaire(questionIds)
        }

        function onFailAssociateQuestionWithQuestionaire(topic, data){

        }

        var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire)
        var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire)

        function onSuccessfullFetchedQuestionaireDetails(topic, res){
            var data = res.data;
            console.log(this.options)
            return
            options.responseData = data;

            model.initialize(options)

            model.onClickUsePrevButtonModal(function(){
                console.log("hi")
            })

            model.onClickSaveQuestion(function(questionData) {
                var questionaireData = {
                    "author": options.author,
                    "tags": options.tags,
                    "authorType": options.authorType,
                    "invocation": questionaireInvocation["screening"],
                    "association": options.association,
                    "sections": [{
                        "type": "static",
                        "questions": []
                    }]
                };
                var extraParameters = {}
                extraParameters.questionData = questionData
                createQuestionaire(questionaireData, extraParameters)
            })
        }

        function onFailFetchedQuestionaireDetails(topic, data){

        }

        var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails)
        var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails)
    }

}
