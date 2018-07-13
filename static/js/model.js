
import { createElement, transformId, transformClass, toggleSlideOptions, createCheckbox, createSlideDropDown, createSelectDropdown, createTextarea } from './utilities/common';
import { questionTypeOptions, globalParameters } from "./global"

var settings = {}

export function initialize(data) {
    settings.addedQuestions = []
    if(data["questionaire"][0]) {
        settings.addedQuestions = data["questionaire"][0]["sections"][0]["questions"]
    }

    settings.totalQuestAddedCount = settings.addedQuestions.length;
    settings.prevQuestions = data["prevQuestions"];
    settings.options = data.options;
    settings.questionTextareaVal = ''
    settings.questTypeVal = 'multi'
    settings.questionOptionsVal = []

    var wrapper = createElement("div", ["wrapper"]);
    wrapper.html(createWrapperContent());

    $("#container").html(wrapper[0].outerHTML)

    settings.addQuestContainer = $("#" + transformId("addQuestContainer"))
    settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"))
    settings.addedQuestContainer = $("#" + transformId("addedQuestContainer"))
    settings.usePrevButton = $("#" + transformId("usePrevButton"))
    settings.addQuestButton = $("#" + transformId("addQuestButton"))
    settings.addQuestButtonModal = $("#" + transformId("addQuestButtonModal"))
    settings.questionTextarea = $("#" + transformId("questionTextarea"))
    settings.questionType = $("#" + transformId("questionType"))
    settings.usePrevButtonModal = $("#" + transformId("usePrevButtonModal"))
    settings.questMandatory = $("#" + transformId("addQuestionHeader-isQuestMandatory"))
    settings.addQuestOptionButton = $("#" + transformId("addQuestOptionButton"))
    settings.actionButtonsContainer = $("#" + transformId("actionButtonsContainer"))

    settings.optionsTextarea = $("." + transformClass(["optionsTextarea"]))
    settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]))

    settings.addQuestButton.click(function(e) {
        e.stopPropagation()
        settings.addQuestContainer.removeClass("hidden")
    })

    $("body").click(function() {
        closeContainer()
    })

    $("." + transformClass(["container"])).click(function(event) {
        event.stopPropagation()
    })

    $("." + transformClass(["cancel-container-button"])).click(function(event) {
        event.stopPropagation()
        closeContainer()
    })

    toggleSlideOptions(settings.usePrevQuestContainer)

    toggleSlideOptions(settings.addedQuestContainer)

    onClickUsePrevButton()

    onClickAddQuestOption()

    onChangeQuestType()

    onClickDeleteQuestOption()

    onChangeQuestTextarea()

    onChangeOptionsTextarea()

    onClickEditQuestion()

    onClickPrevQuestCheckboxModal()

}

export function onClickDeleteQuestion(fn) {
    settings.addedQuestContainer.on('click', '.' + transformClass(["deleteQuestIcon"]),function(){
        debugger
        var questionId = $(this).closest("." + transformClass(["section-row"])).attr("data-questionId");
        fn(questionId)
    })
}

function onClickEditQuestion() {
    settings.addedQuestContainer.on('click', '.' + transformClass(["editQuestIcon"]),function(){

    })
}

function onChangeOptionsTextarea() {
    settings.addQuestContainer.on('keyup',"." + transformClass(["optionsTextarea"]), function(){
        settings.questionOptionsVal = []
        $.each(settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])).slice(0, 2), function(index, anOption) {
            settings.questionOptionsVal.push(($(anOption).val()).trim())
        })
        validateAddQuestData(settings.questTypeVal)
    })
}

function onChangeQuestTextarea() {
    settings.addQuestContainer.on('keyup',"#" + transformId("questionTextarea"), function(){
        settings.questionTextareaVal = ($(this).val()).trim()
        validateAddQuestData(settings.questTypeVal)
    })
}

function validateAddQuestData(questionType) {

    var flag = 1

    if(!settings.questionTextareaVal) {
        flag = 0
    }
    if(["multi", "single"].indexOf(questionType) != -1) {
        if(!settings.questionOptionsVal.length) {
            flag = 0
        }
        settings.questionOptionsVal.forEach(function(questOption){
            if(!questOption) {
                flag = 0
            }
        })
    }

    if(flag == 1) {
        return settings.addQuestButtonModal.prop("disabled", false).removeClass(transformClass(["disabled"]));
    }

    return settings.addQuestButtonModal.prop("disabled", true).addClass(transformClass(["disabled"]));
}

function onClickDeleteQuestOption() {
    settings.addQuestContainer.on('click', "." + transformClass(["deleteOptionButton"]), function(e){
        $(this).parent().remove();
        var optionsLength = settings.addQuestContainer.find(".my-plugin-optionsTextarea").length
        if(optionsLength <= 2) {
            settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).addClass("hidden");
        }
    })
}

function onChangeQuestType() {
    settings.questionType.change(function(e) {
        settings.questTypeVal = $(this).find('option:selected').attr("data-label") || '';
        settings.addQuestContainer.find("." + transformClass(["section-content"])).html(createAddQuestSectionContent(settings.questTypeVal))
        settings.addQuestButtonModal.addClass(transformClass(["disabled"]))
        settings.questionTextareaVal = ''
        settings.questionOptionsVal = []
        settings.questMandatory.prop("checked", false)
    })
}

export function closeContainer() {
    $("." + transformClass(["container"])).addClass("hidden");
    settings.addQuestContainer.find("textarea").val('');
    settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).prop('checked', false);
    settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).prop('disabled', false);
    settings.addQuestButtonModal.addClass(transformClass(["disabled"]))
}

function onClickAddQuestOption() {
    settings.addQuestOptionButton.click(function(e) {
        e.stopPropagation()
        var optionsLength = settings.addQuestContainer.find(".my-plugin-optionsTextarea").length
        settings.addQuestContainer.find("." + transformClass(["options-wrapper"])).append(createTextarea(1, optionsLength))
        if(optionsLength >= 2) {
            settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).removeClass("hidden");
        }
    })
}

function onClickUsePrevButton() {
    settings.usePrevButton.click(function(e) {
        e.stopPropagation()
        settings.usePrevQuestContainer.removeClass("hidden")
    })
}

export function onClickAddQuestion(fn) {
    settings.addQuestButtonModal.click(function(e) {
        e.stopPropagation()

        var data = {}
        data["question"] = ($($("#" + transformId("questionTextarea"))[0]).val()).trim()
        data["type"] = parseInt(settings.questionType.val())
        var ansOptions = []

        $.each(settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])), function(index, anOption) {
            ansOptions.push($(anOption).val())
        })
        data["answerOptions"] = ansOptions
        data["author"] = settings.options.author
        data["mandatory"] = settings.questMandatory.is(":checked")
        fn(data)
    })
}

export function onClickUsePrevButtonModal(fn) {
    settings.usePrevButtonModal.click(function(event) {
        event.stopPropagation()
        var checkedPrevQuestions = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked')
        var prevQuestionIds = []
        $.each(checkedPrevQuestions , function(index, aPrevQuestion) {
            prevQuestionIds.push($(aPrevQuestion).val())
        })
        fn(prevQuestionIds)
    })
}

function createWrapperContent() {

    var mainContainer = createElement("div", ["main-container"]);
    mainContainer.html(createMainContainer())

    return mainContainer[0].outerHTML
}

function createMainContainer() {

    var heading = createElement("div", ["heading"]).text(settings.options["title"]);
    var subHeading = createElement("div", ["sub-heading"]).text(settings.options["subTitle"]);

    var addedQuestContainer = createElement("div", ["added-quest-container"], "addedQuestContainer");
    addedQuestContainer.html(createAddedQuestContainer())

    var actionButtonsCont = createElement("div", ["action-button-container"], "actionButtonsContainer");
    var addQuestButton = createElement("button", ["button"], "addQuestButton").text("Add Question");

    var addQuestContainer = createElement("div", [
        "container", "addQuestContainer"
    ], "addQuestContainer").addClass("hidden")
    addQuestContainer.html(createAddQuestContainer())

    var actionButtonsContStr = addQuestButton[0].outerHTML + addQuestContainer[0].outerHTML

    if(settings.prevQuestions.length) {

        var text = createElement("span", ["or-text"]).text("or");
        var usePrevButton = createElement("button", ["button"], "usePrevButton").text("Use previously used questions");
        var usePrevQuestContainer = createElement("div", [
            "container", "usePrevQuestContainer"
        ], "usePrevQuestContainer").addClass("hidden");
        usePrevQuestContainer.html(createUsePrevQuestContainer(settings.prevQuestions))

        actionButtonsContStr = addQuestButton[0].outerHTML + text[0].outerHTML + usePrevButton[0].outerHTML + addQuestContainer[0].outerHTML + usePrevQuestContainer[0].outerHTML
    }

    actionButtonsCont.html(actionButtonsContStr)

    if(settings.totalQuestAddedCount == 10) {
        actionButtonsCont.addClass("hidden")
    }

    if(!settings.totalQuestAddedCount) {
        addedQuestContainer.addClass("hidden")
    }

    return heading[0].outerHTML + subHeading[0].outerHTML + addedQuestContainer[0].outerHTML + actionButtonsCont[0].outerHTML
}

function createAddedQuestContainer() {

    var heading = createElement("div", ["section-heading", "totalQuestAdded"]).text("Your Added Questions ("+settings.totalQuestAddedCount+"/10)");
    var questionsContent = createElement("div", ["section-content"], "addedQuestContent");

    if(settings.totalQuestAddedCount) {
        questionsContent.html(createAddedQuestionsContent(settings.addedQuestions))
    }

    return heading[0].outerHTML + questionsContent[0].outerHTML
}

function createAddedQuestionsContent(data) {
    var sectionRowStr = ''
    data.forEach(function(addedQuest) {
        sectionRowStr += createAddedQuestRow(addedQuest)
    })
    return sectionRowStr
}

function createAddedQuestRow(data) {
    var row = createElement("div", ["section-row"]).attr("data-questionId", data["id"]);

    var sortIcon = createElement("div", ["sort-icon"]);

    var questionWrapper = createElement("div", ["added-question-wrapper"]);
    var questionText = createElement("div", ["question-text"]).text(data["question"]);

    var questionWrapperStr = ''

    if(data["answerOptions"] && data["answerOptions"].length){
        var optionsSlideDropdown = createSlideDropDown(data["answerOptions"]);
        questionWrapperStr = questionText[0].outerHTML + optionsSlideDropdown
    }
    else {
        questionWrapperStr = questionText[0].outerHTML;
    }

    questionWrapper.html(questionWrapperStr)

    var questionActions = createElement("div", ["question-actions-container"]);
    var mandatoryIcon = createElement("div",["question-action-icon", "mandatory-icon"]);
    var editIcon = createElement("div",["question-action-icon", "edit-icon", "editQuestIcon"]);
    var deleteIcon = createElement("div",["question-action-icon", "delete-icon", "deleteQuestIcon"]);

    if(data["mandatory"] == false){
        mandatoryIcon.addClass("hidden")
    }

    questionActions.html(mandatoryIcon[0].outerHTML + editIcon[0].outerHTML + deleteIcon[0].outerHTML)

    row.html(sortIcon[0].outerHTML + questionWrapper[0].outerHTML + questionActions[0].outerHTML)

    return row[0].outerHTML
}

export function appendQuestionsAdded(data) {
    settings.addedQuestContainer.find("." + transformClass(["section-content"])).append(createAddedQuestionsContent(data)).removeClass("hidden")
    settings.addedQuestContainer.removeClass("hidden")
}

function createAddQuestContainer() {
    var sectionHeader = createElement("div", ["section-header"]);
    var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
    var checkbox = createCheckbox(transformId("addQuestionHeader-isQuestMandatory"), null, null, null, "Mandatory");
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createAddQuestSectionContent(settings.questTypeVal))

    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button"], "addQuestButtonModal").prop({
        "disabled": true
    }).text("Add").addClass(transformClass(["disabled"]));
    var cancelButton = createElement("button", ["button", "borderLess-button", "cancel-container-button"]).text("Cancel");
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML)

    return sectionHeader[0].outerHTML + sectionContent[0].outerHTML +sectionFooter[0].outerHTML
}

function createUsePrevQuestContainer(data) {
    var sectionHeading = createElement("div", ["section-heading"]).text("Use previously added question");
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createUsePrevQuestSectionContent(data))
    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button"], "usePrevButtonModal").text("Add selected questions");
    var cancelButton = createElement("button", ["button", "borderLess-button", , "cancel-container-button"]).text("Cancel");
    var totalQuestionsAdded = createElement("div", ["quest-added-text", "totalQuestAdded"]).text("Questions added: "+settings.totalQuestAddedCount+"/10")
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML)

    return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML
}

function createUsePrevQuestSectionContent(data) {
    var sectionRowStr = ''
    data.forEach(function(aPrevQuestion){
        var sectionRow = createElement("div", ["section-row"]);
        var checkbox = createCheckbox("addQuestSectionRow" + aPrevQuestion["id"], null, aPrevQuestion["id"], null, aPrevQuestion["question"]);
        var questionWrapperStr = ''

        if (aPrevQuestion["answerOptions"] && aPrevQuestion["answerOptions"].length) {
            var optionsSlideDropdown = createSlideDropDown(aPrevQuestion["answerOptions"])
            questionWrapperStr = checkbox + optionsSlideDropdown
        }
        else {
            questionWrapperStr = checkbox
        }
        sectionRow.html(questionWrapperStr)
        sectionRowStr += sectionRow[0].outerHTML
    })

    return sectionRowStr;
}

function createAddQuestSectionContent(questionType) {
    var questionText = createElement("div", ["text"]).text("Question Text*");
    var questionTextarea = createElement("textarea", ["textarea"], "questionTextarea").attr({"placeholder": "What would you like to ask?"});

    if (["multi", "single"].indexOf(questionType) != -1) {
        let optionsWrapper = createElement("div", ["options-wrapper"]);
        let optionTextArea = createTextarea(2, 0)
        let addOptionButton = createElement("button", ["button", "borderLess-button", "add-quest-option"], "addQuestOptionButton").text("Add Option");
        optionsWrapper.html(optionTextArea)
        return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + addOptionButton[0].outerHTML;
    }

    return questionText[0].outerHTML + questionTextarea[0].outerHTML;
}

function onClickPrevQuestCheckboxModal() {
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-input"]), function(event) {
        event.stopPropagation()
        if ($(this).is(":checked")) {
            settings.totalQuestAddedCount += 1;
            if (settings.totalQuestAddedCount == 10) {
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", true);
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').attr("disabled", false);
            }
        } else {
            settings.totalQuestAddedCount -= 1;
            settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", false);
        }
        settings.usePrevQuestContainer.find('.' + transformClass(["totalQuestAdded"])).text("Questions added: "+settings.totalQuestAddedCount+"/10");
    })
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-label"]), function(event) {
        event.stopPropagation()
    })
}

export function deleteAddedQuestionRow(id) {
    settings.addedQuestContainer.find("." + transformClass(["section-row"]) + "[data-questionId="+id+"]").remove()
}

export function showActionButtonContainer() {
    settings.actionButtonsContainer.removeClass("hidden");
}

export function hideActionButtonContainer() {
    settings.actionButtonsContainer.addClass("hidden");
}

export function updateTotalQuestionsAddedText(data) {
    settings.totalQuestAdded.text("Questions added: " + data + "/10")
    settings.totalQuestAddedCount = data;
}

export function hideAddedQuestionContainer() {
    settings.addedQuestContainer.addClass("hidden");
}
//
// export function updateTotalQuestionsAddedText()

// export function populatePreviousUsedQuestions(data) {
//     settings.usePrevQuestContainer.find("." + transformClass(["section-content"])).html(createUsePrevQuestSectionContent(data))
// }
