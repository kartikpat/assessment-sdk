
import * as common from './utilities/common';
// import * as global from './global';
import * as model from './model';
import {associateQuestionWithQuestionaire} from './services/association/associateQuestionWithQuestionaire';
import {createQuestion} from './services/question/createQuestion';
import {fetchQuestions} from './services/question/fetchQuestions';
import {createQuestionaire} from './services/questionaire/createQuestionaire';
import {fetchQuestionaire} from './services/questionaire/fetchQuestionaire';

// Create an immediately invoked functional expression to wrap our code
(function() {

    // Define our constructor
    this.Test = function() {
        // Create global element references
        this.title = null;
        this.subTitle = null;
        this.addQuesButtonText = null;
        this.prevQuestContainerHeading = null;
        this.tags = {};

        // Define option defaults
        var defaults = {
            title: 'Screening Questions',
            subTitle: 'You can ask some questions before the candidates apply to your job!',
            addQuesButtonText: 'Add Question',
            usePrevButtonText: 'Use previously added questions',
            prevQuestContainerHeading: 'Previously Used Screening Questions'
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = common.extendDefaults(defaults, arguments[0]);
        }
    }

    // Private Variables
    var options;
    var questions = {}

    // Public Methods
    Test.prototype.init = function() {
        debugger

        options = this.options;
        console.log(options)
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
                    "questions": questionRows
                }

                return pubsub.publish("fetchedQuestionaireDetails", data);
            }

        }, function(res, status, error) {
            return pubsub.publish("failedToFetchQuestionaireDetails", res);
        });
    }

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
        console.log(res)
        var data = res.data;

        options.responseData = data;
        debugger
        initialize(options)

        onClickUsePrevButton(function(){

        })

        onClickAddUsePrevButton()

        onClickSaveQuestion(function(questionData) {
            var questionaireData = {
                "name": "abcd",
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

}());
