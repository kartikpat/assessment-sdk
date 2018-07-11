
import { createElement, transformId, transformClass, toggleSlideOptions, createCheckbox, createSlideDropDown, createSelectDropdown, closeContainer, createTextarea } from './utilities/common';
import { questionTypeOptions, settings } from "./global"

export function initialize(data) {
    settings.totalQuestAddedCount = data.questionaire[0]["sections"][0]["questions"].length;
    settings.options = data.options;
    settings.prevQuestions = data.prevQuestions;

    var wrapper = createElement("div", ["wrapper"]);
    wrapper.html(createWrapperContent());

    $("#container").html(wrapper[0].outerHTML)

    settings.addQuestContainer = $("#" + transformId("addQuestContainer"))
    settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"))
    settings.usePrevButton = $("#" + transformId("usePrevButton"))
    settings.addQuestButton = $("#" + transformId("addQuestButton"))
    settings.addQuestButtonModal = $("#" + transformId("addQuestButtonModal"))
    settings.questionTextarea = $("#" + transformId("questionTextarea"))
    settings.questionType = $("#" + transformId("questionType"))
    settings.usePrevButtonModal = $("#" + transformId("usePrevButtonModal"))
    settings.questMandatory = $("#" + transformId("addQuestionHeader-isQuestMandatory"))
    settings.addQuestOptionButton = $("#" + transformId("addQuestOptionButton"))

    settings.optionsTextarea = $("." + transformClass(["optionsTextarea"]))
    settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]))

    updateTotalQuestionsAddedText()

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

    onClickPrevQuestCheckboxModal()

    toggleSlideOptions(settings.usePrevQuestContainer)

    onClickUsePrevButton()

    onClickAddQuestOption()

    onChangeQuestType()

    onClickDeleteQuestOption()
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
    settings.questionType.change(function(e){
        var type = $(this).find('option:selected').attr("data-label");
        settings.addQuestContainer.find("." + transformClass(["section-content"])).html(createAddQuestSectionContent(type))
    })
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
        data["question"] = settings.questionTextarea.val()
        data["type"] = settings.questionType.val()
        var ansOptions = []
        $.each(settings.optionsTextarea, function(index, anOption) {
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
        fn()
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

    // var addedQuestContainer = createElement("div", ["added-quest-container"], "addedQuestContainer")
    // addedQuestContainer.html(createAddedQuestContainer())

    var actionButtonsCont = createElement("div", ["action-button-container"]);
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

    return heading[0].outerHTML + subHeading[0].outerHTML + actionButtonsCont[0].outerHTML
}

// function createAddedQuestContainer() {
//     var heading = createElement("div", ["heading"]);
//     var questionsContent = createElement("div", ["content"]);
//     questionsContent.html(createQuestionsContent())
//     var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
//     var checkbox = createCheckbox(transformId("addQuestionHeader-isQuestMandatory"), null, null, null, "Mandatory");
//     sectionHeader.html(selectDropdown + checkbox);
//     var sectionContent = createElement("div", ["section-content"]);
//     sectionContent.html(createAddQuestSectionContent(1))
//     return sectionHeader[0].outerHTML + sectionContent[0].outerHTML
// }

// function createQuestionsContent() {}

function createAddQuestContainer() {
    var sectionHeader = createElement("div", ["section-header"]);
    var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
    var checkbox = createCheckbox(transformId("addQuestionHeader-isQuestMandatory"), null, null, null, "Mandatory");
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createAddQuestSectionContent("multi"))

    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button"], "addQuestButtonModal").text("Add");
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
    var totalQuestionsAdded = createElement("div", ["quest-added-text", "totalQuestAdded"]).text("Questions added: 0/10")
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML)

    return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML
}

function createUsePrevQuestSectionContent(data) {
    var sectionRowStr = ''
    data.forEach(function(aQuestion) {
        var sectionRow = createElement("div", ["section-row"]);
        var checkbox = createCheckbox("addQuestSectionRow" + aQuestion["id"], null, aQuestion["id"], null, aQuestion["question"]);
        if (aQuestion["answerOptions"].length) {
            var slideDropdown = createSlideDropDown(aQuestion["answerOptions"])
        }

        sectionRow.html(checkbox + slideDropdown)
        sectionRowStr += sectionRow[0].outerHTML

    });

    return sectionRowStr;
}

function createAddQuestSectionContent(questionType) {
    var questionText = createElement("div", ["text"]).text("Question Text");
    var questionTextarea = createElement("textarea", ["textarea"], "questionTextarea").attr({"placeholder": "What would you like to ask?"});

    if (["multi", "single"].indexOf(questionType) != -1) {
        let optionsWrapper = createElement("div", ["options-wrapper"]);
        let optionTextArea = createTextarea(2, 0)
        let addOptionButton = createElement("button", ["button", "borderLess-button", "add-quest-option"], "addQuestOptionButton").text("Add");
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
            updateTotalQuestionsAddedText()
            if (settings.totalQuestAddedCount == 10) {
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", true);
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').attr("disabled", false);
            }
            // var el = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked')
            // console.log(el)
        } else {
            settings.totalQuestAddedCount -= 1;
            updateTotalQuestionsAddedText()
            settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", false);
        }
    })
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-label"]), function(event) {
        event.stopPropagation()
    })
}

function updateTotalQuestionsAddedText() {
    settings.totalQuestAdded.text("Questions added: " + settings.totalQuestAddedCount + "/10")
}

// export function populatePreviousUsedQuestions(data) {
//     settings.usePrevQuestContainer.find("." + transformClass(["section-content"])).html(createUsePrevQuestSectionContent(data))
// }
