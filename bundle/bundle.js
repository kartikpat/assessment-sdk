var assessmentSdk = (function () {
'use strict';

var pluginName = "my-plugin-";

var baseUrl = "http://127.0.0.1:5000";

var globalParameters = {
    questionaireId: null,
    questionIds: [],
    prevQuestions: {}
};

var questionTypeOptions = [{
    "value": 1,
    "text": "Multi choice",
    "data-label": "multi"
}, {
    "value": 2,
    "text": "Single choice",
    "data-label": "single"
}, {
    "value": 3,
    "text": "Yes/No Question"
}, {
    "value": 4,
    "text": "Short Answer"
}, {
    "value": 5,
    "text": "Long Answer"
}];

var questionaireInvocation = {
    "screening": 1
};

function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
}

function transformClass(classNameArr) {
    var classNameStr = '';
    var transformedArr = [];
    classNameArr.forEach(function (className) {
        className = pluginName + className;
        transformedArr.push(className);
    });
    classNameStr = transformedArr.join(" ");
    return classNameStr;
}

function transformId(id) {
    return pluginName + id;
}

function createElement(elem, classNameArr, id) {
    var domElem = $("<" + elem + "></" + elem + ">");
    if (classNameArr && classNameArr.length) {
        domElem.addClass(transformClass(classNameArr));
    }
    if (id) {
        domElem.attr("id", transformId(id));
    }
    return domElem;
}

function createCheckbox(id, name, value, dataLabel, text) {
    var checkboxWrapper = createElement("div", ["checkbox-wrapper"]);

    var input = createElement("input", ["checkbox-input"]).attr({ "id": id, "type": "checkbox", "name": name, "value": value, "data-label": dataLabel });
    var label = createElement("label", ["checkbox-label"]).attr({ "for": id }).text(text);

    checkboxWrapper.html(input[0].outerHTML + label[0].outerHTML);
    return checkboxWrapper[0].outerHTML;
}

function createSlideDropDown(options) {
    var slideWrapper = createElement("div", ["slide-wrapper"]);
    var toggleButton = createElement("div", ["slide-toggle-button"]).text("view options");
    var optionsWrapper = createElement("div", ["options-wrapper"]);
    var optionRowStr = '';

    options.forEach(function (anOption) {
        var optionRow = createElement("div", ["option-row"]).text(anOption);
        optionRowStr += optionRow[0].outerHTML;
    });
    optionsWrapper.html(optionRowStr);
    slideWrapper.html(toggleButton[0].outerHTML + optionsWrapper[0].outerHTML);
    return slideWrapper[0].outerHTML;
}

function createSelectDropdown(options, classNameArr, defaultVal) {
    var select = createElement("select", classNameArr);
    var optionRowStr = '';
    options.forEach(function (anOption) {
        var optionRow = createElement("option", ["option-row"]).attr({
            "value": anOption["value"],
            "data-label": anOption["data-label"]
        }).text(anOption["text"]);
        if (defaultVal == parseInt(anOption["value"])) {
            optionRow.attr("selected", "selected");
        }
        optionRowStr += optionRow[0].outerHTML;
    });
    select.html(optionRowStr);
    return select[0].outerHTML;
}

function toggleSlideOptions(elem) {
    elem.on('click', '.' + transformClass(["slide-toggle-button"]), function (event) {
        event.stopPropagation();
        $(this).next().slideToggle();
    });
}

function createTextarea(n, offset, data) {
    if (!n) return;

    var j = offset || 0;
    var i;
    var textareaStr = '';
    for (i = 0; i < n; i++) {
        var optionsTextareaWrapper = createElement("div", ["options-textarea-wrapper"]);
        var textarea = createElement("textarea", ["textarea", "small", "optionsTextarea"]).attr({
            "placeholder": "Option " + (j + 1)
        });
        if (data.length) {
            textarea.val(data[i]);
        }
        j++;
        var cancelButton = createElement("span", ["cross-button", "deleteOptionButton", "icon-cross"]).addClass("hidden");
        optionsTextareaWrapper.html(textarea[0].outerHTML + cancelButton[0].outerHTML);

        textareaStr += optionsTextareaWrapper[0].outerHTML;
    }
    return textareaStr;
}

var settings = {};

function initialize(data) {
    settings.addedQuestions = [];
    if (data["questionaire"] && data["questionaire"][0]) {
        settings.addedQuestions = data["questionaire"][0]["sections"][0]["questions"];
    }

    settings.totalQuestAddedCount = settings.addedQuestions.length;
    settings.prevQuestions = data["prevQuestions"];
    settings.options = data.options;
    settings.questionTextareaVal = '';
    settings.questionOptionsVal = [];

    var wrapper = createElement("div", ["wrapper"]);
    wrapper.html(createWrapperContent());

    $("#" + data.options.wrapperName).html(wrapper[0].outerHTML);

    settings.addQuestContainer = $("#" + transformId("addQuestContainer"));
    settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"));
    settings.addedQuestContainer = $("#" + transformId("addedQuestContainer"));
    settings.usePrevButton = $("#" + transformId("usePrevButton"));
    settings.addQuestButton = $("#" + transformId("addQuestButton"));
    settings.addQuestButtonModal = $("#" + transformId("addQuestButtonModal"));
    settings.usePrevButtonModal = $("#" + transformId("usePrevButtonModal"));
    settings.actionButtonsContainer = $("#" + transformId("actionButtonsContainer"));
    settings.addedQuestContent = $("#" + transformId("addedQuestContent"));

    settings.editQuestContainer = $("." + transformClass(["editQuestContainer"]));
    settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]));

    settings.addQuestButton.click(function (e) {
        e.stopPropagation();
        settings.addQuestContainer.removeClass("hidden");
    });

    $("body").click(function () {
        closeContainer();
    });

    $("." + transformClass(["container"])).click(function (event) {
        event.stopPropagation();
    });

    $("." + transformClass(["cancel-container-button"])).click(function (event) {
        event.stopPropagation();
        closeContainer();
    });

    toggleSlideOptions(settings.usePrevQuestContainer);

    toggleSlideOptions(settings.addedQuestContainer);

    onClickUsePrevButton();

    onClickAddQuestOption();

    onChangeQuestType();

    onClickDeleteQuestOption();

    onChangeQuestTextarea();

    onChangeOptionsTextarea();

    onClickPrevQuestCheckboxModal();

    onClickEditQuestion();
}

function onClickEditQuestion() {
    settings.addedQuestContainer.on('click', '.' + transformClass(["editQuestIcon"]), function (event) {
        event.stopPropagation();
        $(this).next().removeClass("hidden");
        // fn(questionId)
    });
}

function setSortableList(fn) {
    Sortable.create(settings.addedQuestContent[0], {
        handle: '.' + transformClass(["sort-icon"]),
        animation: 150,
        ghostClass: transformClass(["ghost"]),
        // Element dragging ended
        onEnd: function onEnd(evt) {
            var questionIds = [];
            $.each(settings.addedQuestContent.find("." + transformClass(["section-row"])), function (index, sectionRow) {
                questionIds.push($(sectionRow).attr("data-questionId"));
            });
            fn(questionIds);
        }
    });
}

function onClickDeleteQuestion(fn) {
    settings.addedQuestContainer.on('click', '.' + transformClass(["deleteQuestIcon"]), function () {
        var questionId = $(this).closest("." + transformClass(["section-row"])).attr("data-questionId");
        fn(questionId);
    });
}

function onChangeOptionsTextarea() {
    settings.addQuestContainer.on('keyup', "." + transformClass(["optionsTextarea"]), function () {
        settings.questionOptionsVal = [];
        $.each(settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])).slice(0, 2), function (index, anOption) {
            settings.questionOptionsVal.push($(anOption).val().trim());
        });
        var questTypeVal = settings.addQuestContainer.find("." + transformClass(["questionType"])).find("option:selected").attr("data-label") || '';
        if (validateAddQuestData(questTypeVal)) {
            return settings.addQuestButtonModal.prop("disabled", false).removeClass(transformClass(["disabled"]));
        }
        return settings.addQuestButtonModal.prop("disabled", true).addClass(transformClass(["disabled"]));
    });
    settings.editQuestContainer.on('keyup', "." + transformClass(["optionsTextarea"]), function () {
        settings.questionOptionsVal = [];
        $.each(settings.editQuestContainer.find("." + transformClass(["optionsTextarea"])).slice(0, 2), function (index, anOption) {
            settings.questionOptionsVal.push($(anOption).val().trim());
        });
        var questTypeVal = settings.editQuestContainer.find("." + transformClass(["questionType"])).find("option:selected").attr("data-label") || '';
        if (validateAddQuestData(questTypeVal)) {
            return $(this).closest("." + transformClass(["editQuestContainer"])).find("." + transformClass(["editQuestButtonModal"])).prop("disabled", false).removeClass(transformClass(["disabled"]));
        }
        return $(this).closest("." + transformClass(["editQuestContainer"])).find("." + transformClass(["editQuestButtonModal"])).prop("disabled", true).addClass(transformClass(["disabled"]));
    });
}

function onChangeQuestTextarea() {
    settings.addQuestContainer.on('keyup', "." + transformClass(["questionTextarea"]), function () {
        settings.questionTextareaVal = $(this).val().trim();
        var questTypeVal = settings.addQuestContainer.find("." + transformClass(["questionType"])).find("option:selected").attr("data-label") || '';
        if (validateAddQuestData(questTypeVal)) {
            return settings.addQuestButtonModal.prop("disabled", false).removeClass(transformClass(["disabled"]));
        }
        return settings.addQuestButtonModal.prop("disabled", true).addClass(transformClass(["disabled"]));
    });
    settings.editQuestContainer.on('keyup', "." + transformClass(["questionTextarea"]), function () {
        settings.questionTextareaVal = $(this).val().trim();
        var questTypeVal = settings.editQuestContainer.find("." + transformClass(["questionType"])).find("option:selected").attr("data-label") || '';
        if (validateAddQuestData(questTypeVal)) {
            return $(this).closest("." + transformClass(["editQuestContainer"])).find("." + transformClass(["editQuestButtonModal"])).prop("disabled", false).removeClass(transformClass(["disabled"]));
        }
        return $(this).closest("." + transformClass(["editQuestContainer"])).find("." + transformClass(["editQuestButtonModal"])).prop("disabled", true).addClass(transformClass(["disabled"]));
    });
}

function validateAddQuestData(questionType) {

    var flag = 1;

    if (!settings.questionTextareaVal) {
        flag = 0;
    }
    if (["multi", "single"].indexOf(questionType) != -1) {
        if (!settings.questionOptionsVal.length) {
            flag = 0;
        }
        settings.questionOptionsVal.forEach(function (questOption) {
            if (!questOption) {
                flag = 0;
            }
        });
    }

    if (flag == 1) {
        return true;
    }

    return false;
}

function onClickDeleteQuestOption() {
    settings.addQuestContainer.on('click', "." + transformClass(["deleteOptionButton"]), function (e) {
        $(this).parent().remove();
        var optionsLength = settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])).length;
        if (optionsLength <= 2) {
            settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).addClass("hidden");
        }
    });
    settings.editQuestContainer.on('click', "." + transformClass(["deleteOptionButton"]), function (e) {
        $(this).parent().remove();
        var optionsLength = $(this).closest("." + transformClass(["editQuestContainer"])).find("." + transformClass(["optionsTextarea"])).length;
        if (optionsLength <= 2) {
            $(this).closest("." + transformClass(["editQuestContainer"])).find('.' + transformClass(["deleteOptionButton"])).addClass("hidden");
        }
    });
}

function onChangeQuestType() {
    settings.addQuestContainer.on('change', "." + transformClass(["questionType"]), function (e) {
        var questTypeVal = $(this).find('option:selected').attr("data-label") || '';
        settings.addQuestContainer.find("." + transformClass(["section-content"])).html(createAddQuestSectionContent(questTypeVal));
        settings.addQuestButtonModal.prop("disabled", true).addClass(transformClass(["disabled"]));
        settings.questionTextareaVal = '';
        settings.questionOptionsVal = [];
    });
    settings.editQuestContainer.on('change', "." + transformClass(["questionType"]), function (e) {
        // settings.questTypeVal = $(this).find('option:selected').attr("data-label") || '';
        // settings.addQuestContainer.find("." + transformClass(["section-content"])).html(createAddQuestSectionContent(settings.questTypeVal))
        // settings.addQuestButtonModal.addClass(transformClass(["disabled"]))
        // settings.questionTextareaVal = ''
        // settings.questionOptionsVal = []
        // settings.questMandatory.prop("checked", false)
    });
}

function closeContainer() {
    $("." + transformClass(["container"])).addClass("hidden");
    settings.addQuestContainer.find("." + transformClass(["questionTextarea"])).val('');
    settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).prop({
        'checked': false,
        'disabled': false
    });
    settings.addQuestButtonModal.addClass(transformClass(["disabled"]));
    settings.totalQuestAddedCount = globalParameters.questionIds.length;
    settings.usePrevQuestContainer.find('.' + transformClass(["totalQuestAdded"])).text("Questions added: " + settings.totalQuestAddedCount + "/10");
    settings.questionTextareaVal = '';
    settings.questionOptionsVal = [];
}

function onClickAddQuestOption() {
    settings.addQuestContainer.on('click', "." + transformClass(["addQuestOptionButton"]), function (e) {
        e.stopPropagation();
        var optionsLength = settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])).length;
        settings.addQuestContainer.find("." + transformClass(["options-wrapper"])).append(createTextarea(1, optionsLength, []));
        if (optionsLength >= 2) {
            settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).removeClass("hidden");
        }
    });
    settings.editQuestContainer.on('click', "." + transformClass(["addQuestOptionButton"]), function (e) {
        e.stopPropagation();
        var optionsLength = settings.editQuestContainer.find("." + transformClass(["optionsTextarea"])).length;
        settings.editQuestContainer.find("." + transformClass(["options-wrapper"])).append(createTextarea(1, optionsLength, []));
        if (optionsLength >= 2) {
            settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).removeClass("hidden");
        }
    });
}

function onClickUsePrevButton() {
    settings.usePrevButton.click(function (e) {
        e.stopPropagation();
        settings.usePrevQuestContainer.removeClass("hidden");
    });
}

function onClickAddQuestion(fn) {
    settings.addQuestButtonModal.click(function (e) {
        e.stopPropagation();

        var data = {};
        data["question"] = settings.addQuestContainer.find("." + transformClass(["questionTextarea"])).val().trim();

        data["type"] = parseInt(settings.addQuestContainer.find("." + transformClass(["questionType"])).val());
        var ansOptions = [];

        $.each(settings.addQuestContainer.find("." + transformClass(["optionsTextarea"])), function (index, anOption) {
            ansOptions.push($(anOption).val().trim());
        });
        if (ansOptions.length) {
            data["answerOptions"] = ansOptions;
        }
        data["author"] = settings.options.author;
        data["mandatory"] = settings.addQuestContainer.find("." + transformClass(["checkbox-input"])).is(":checked");
        return console.log(data);
        fn(data);
    });
}

function onClickEditQuestionModal(fn) {
    settings.addedQuestContainer.on('click', '.' + transformClass(["editQuestButtonModal"]), function (e) {
        e.stopPropagation();
        var data = {};
        var elem = $(this).closest("." + transformClass(["editQuestContainer"]));
        data["question"] = elem.find("." + transformClass(["questionTextarea"])).val().trim();

        data["type"] = parseInt(elem.find("." + transformClass(["questionType"])).val());
        var ansOptions = [];

        $.each(elem.find("." + transformClass(["optionsTextarea"])), function (index, anOption) {
            ansOptions.push($(anOption).val().trim());
        });
        if (ansOptions.length) {
            data["answerOptions"] = ansOptions;
        }
        data["author"] = settings.options.author;
        data["mandatory"] = elem.find("." + transformClass(["checkbox-input"])).is(":checked");
        return console.log(data);
        var questionId = elem.attr("data-questionId");
        console.log(questionId);
        fn(data);
    });
}

function onClickUsePrevButtonModal(fn) {
    settings.usePrevButtonModal.click(function (event) {
        event.stopPropagation();
        var checkedPrevQuestions = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked');
        var prevQuestionIds = [];
        $.each(checkedPrevQuestions, function (index, aPrevQuestion) {
            prevQuestionIds.push($(aPrevQuestion).val());
        });
        fn(prevQuestionIds);
    });
}

function createWrapperContent() {

    var mainContainer = createElement("div", ["main-container"]);
    mainContainer.html(createMainContainer());

    return mainContainer[0].outerHTML;
}

function createMainContainer() {

    var heading = createElement("div", ["heading"]).text(settings.options["title"]);
    var subHeading = createElement("div", ["sub-heading"]).text(settings.options["subTitle"]);

    var addedQuestContainer = createElement("div", ["added-quest-container"], "addedQuestContainer");
    addedQuestContainer.html(createAddedQuestContainer());

    var actionButtonsCont = createElement("div", ["action-button-container"], "actionButtonsContainer");
    var addQuestButton = createElement("button", ["button"], "addQuestButton").text("Add Question");

    var addQuestContainer = createElement("div", ["container", "quest-container", "addQuestContainer"], "addQuestContainer").addClass("hidden");
    addQuestContainer.html(createAddQuestContainer());

    var actionButtonsContStr = addQuestButton[0].outerHTML + addQuestContainer[0].outerHTML;

    if (settings.prevQuestions.length) {

        var text = createElement("span", ["or-text"]).text("or");
        var usePrevButton = createElement("button", ["button"], "usePrevButton").text("Use previously used questions");
        var usePrevQuestContainer = createElement("div", ["container", "usePrevQuestContainer"], "usePrevQuestContainer").addClass("hidden");
        usePrevQuestContainer.html(createUsePrevQuestContainer(settings.prevQuestions));

        actionButtonsContStr = addQuestButton[0].outerHTML + text[0].outerHTML + usePrevButton[0].outerHTML + addQuestContainer[0].outerHTML + usePrevQuestContainer[0].outerHTML;
    }

    actionButtonsCont.html(actionButtonsContStr);

    if (settings.totalQuestAddedCount == 10) {
        actionButtonsCont.addClass("hidden");
    }

    if (!settings.totalQuestAddedCount) {
        addedQuestContainer.addClass("hidden");
    }

    return heading[0].outerHTML + subHeading[0].outerHTML + addedQuestContainer[0].outerHTML + actionButtonsCont[0].outerHTML;
}

function createAddedQuestContainer() {
    var heading = createElement("div", ["section-heading", "totalQuestAdded"]).text("Your Added Questions (" + settings.totalQuestAddedCount + "/10)");
    var questionsContent = createElement("div", ["section-content"], "addedQuestContent");

    if (settings.totalQuestAddedCount) {
        questionsContent.html(createAddedQuestionsContent(settings.addedQuestions));
    }

    return heading[0].outerHTML + questionsContent[0].outerHTML;
}

function createAddedQuestionsContent(data) {
    var sectionRowStr = '';
    data.forEach(function (addedQuest) {
        sectionRowStr += createAddedQuestRow(addedQuest);
    });
    return sectionRowStr;
}

function createAddedQuestRow(data) {
    var row = createElement("div", ["section-row"]).attr("data-questionId", data["id"]);

    var sortIcon = createElement("div", ["sort-icon", "icon-asterisk"]);

    var questionWrapper = createElement("div", ["added-question-wrapper"]);
    var questionText = createElement("div", ["question-text"]).text(data["question"]);

    var questionWrapperStr = '';

    if (data["answerOptions"] && data["answerOptions"].length) {
        var optionsSlideDropdown = createSlideDropDown(data["answerOptions"]);
        questionWrapperStr = questionText[0].outerHTML + optionsSlideDropdown;
    } else {
        questionWrapperStr = questionText[0].outerHTML;
    }

    questionWrapper.html(questionWrapperStr);

    var questionActions = createElement("div", ["question-actions-container"]);
    var mandatoryIcon = createElement("div", ["question-action-icon", "mandatory-icon", "icon-asterisk"]);

    var editWrapper = createElement("div", ["quest-edit-wrapper"]);
    var editIcon = createElement("div", ["question-action-icon", "edit-icon", "editQuestIcon", "icon-edit"]);
    var editQuestContainer = createElement("div", ["container", "quest-container", "edit-quest-container", "editQuestContainer"]).addClass("hidden").attr("data-questionId", data["id"]);
    editQuestContainer.html(createEditQuestContainer(data));
    editWrapper.html(editIcon[0].outerHTML + editQuestContainer[0].outerHTML);

    var deleteIcon = createElement("div", ["question-action-icon", "delete-icon", "deleteQuestIcon", "icon-delete"]);

    if (data["mandatory"] == false) {
        mandatoryIcon.addClass("hidden");
    }

    questionActions.html(mandatoryIcon[0].outerHTML + editWrapper[0].outerHTML + deleteIcon[0].outerHTML);

    row.html(sortIcon[0].outerHTML + questionWrapper[0].outerHTML + questionActions[0].outerHTML);

    return row[0].outerHTML;
}

function appendQuestionsAdded(data) {
    settings.addedQuestContainer.find("." + transformClass(["section-content"])).append(createAddedQuestionsContent(data)).removeClass("hidden");
    settings.addedQuestContainer.removeClass("hidden");
}

function createAddQuestContainer() {
    var sectionHeader = createElement("div", ["section-header"]);
    var selectDropdown = createSelectDropdown(questionTypeOptions, ["select-dropdown", "questionType"]);
    var checkbox = createCheckbox(transformId("addQuestionHeader-isQuestMandatory"), null, null, null, "Mandatory");
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);

    sectionContent.html(createAddQuestSectionContent("multi"));

    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button"], "addQuestButtonModal").prop({
        "disabled": true
    }).text("Add").addClass(transformClass(["disabled"]));
    var cancelButton = createElement("button", ["button", "borderLess-button", "cancel-container-button"]).text("Cancel");
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML);

    return sectionHeader[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
}

function createEditQuestContainer(data) {
    var sectionHeader = createElement("div", ["section-header"]);
    var selectDropdown = createSelectDropdown(questionTypeOptions, ["select-dropdown", "questionType"], parseInt(data["type"]));
    // var questTypeVal = $(selectDropdown).find("option:selected").attr("data-label")
    debugger;
    var checkbox = createCheckbox(transformId("editQuestionHeader-isQuestMandatory-" + data["id"] + ""), null, null, null, "Mandatory");
    if (data["mandatory"]) {
        checkbox.prop("checked", true);
    }
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);

    sectionContent.html(createEditQuestSectionContent(data, "multi"));

    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button", "editQuestButtonModal"]).text("Save");
    var cancelButton = createElement("button", ["button", "borderLess-button", "cancel-container-button"]).text("Cancel");
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML);

    return sectionHeader[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
}

function createUsePrevQuestContainer(data) {
    var sectionHeading = createElement("div", ["section-heading"]).text("Use previously added question");
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createUsePrevQuestSectionContent(data));
    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button", "disabled"], "usePrevButtonModal").text("Add selected questions").prop("disabled", true);
    var cancelButton = createElement("button", ["button", "borderLess-button",, "cancel-container-button"]).text("Cancel");
    var totalQuestionsAdded = createElement("div", ["quest-added-text", "totalQuestAdded"]).text("Your Added Questions: " + settings.totalQuestAddedCount + "/10");
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML);

    return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
}

function createUsePrevQuestSectionContent(data) {
    var sectionRowStr = '';
    data.forEach(function (aPrevQuestion) {
        var sectionRow = createElement("div", ["section-row"]).attr("data-questionId", aPrevQuestion["id"]);
        var checkbox = createCheckbox("addQuestSectionRow" + aPrevQuestion["id"], null, aPrevQuestion["id"], null, aPrevQuestion["question"]);
        var questionWrapperStr = '';

        if (aPrevQuestion["answerOptions"] && aPrevQuestion["answerOptions"].length) {
            var optionsSlideDropdown = createSlideDropDown(aPrevQuestion["answerOptions"]);
            questionWrapperStr = checkbox + optionsSlideDropdown;
        } else {
            questionWrapperStr = checkbox;
        }
        sectionRow.html(questionWrapperStr);
        sectionRowStr += sectionRow[0].outerHTML;
    });

    return sectionRowStr;
}

function createEditQuestSectionContent(data, questionType) {
    var questionText = createElement("div", ["text"]).text("Question Text*");
    var questionTextarea = createElement("textarea", ["textarea", "questionTextarea"]).attr({ "placeholder": "What would you like to ask?" });
    questionTextarea.val(data["question"]);

    if (["multi", "single"].indexOf(questionType) != -1) {
        var optionsWrapper = createElement("div", ["options-wrapper"]);
        if (data["answerOptions"]) {
            var optionTextArea = createTextarea(data["answerOptions"].length, 0, data["answerOptions"]);
        }
        var addOptionButton = createElement("button", ["button", "borderLess-button", "add-quest-option", "addQuestOptionButton"]).text("Add Option");
        optionsWrapper.html(optionTextArea);
        return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + addOptionButton[0].outerHTML;
    }

    return questionText[0].outerHTML + questionTextarea[0].outerHTML;
}

function createAddQuestSectionContent(questionType) {
    var questionText = createElement("div", ["text"]).text("Question Text*");
    var questionTextarea = createElement("textarea", ["textarea", "questionTextarea"]).attr({ "placeholder": "What would you like to ask?" });

    if (["multi", "single"].indexOf(questionType) != -1) {
        var optionsWrapper = createElement("div", ["options-wrapper"]);
        var optionTextArea = createTextarea(2, 0, []);
        var addOptionButton = createElement("button", ["button", "borderLess-button", "add-quest-option", "addQuestOptionButton"]).text("Add Option");
        optionsWrapper.html(optionTextArea);
        return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + addOptionButton[0].outerHTML;
    }

    return questionText[0].outerHTML + questionTextarea[0].outerHTML;
}

function onClickPrevQuestCheckboxModal() {
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-input"]), function (event) {
        event.stopPropagation();
        if ($(this).is(":checked")) {
            settings.usePrevButtonModal.prop("disabled", false).removeClass(transformClass(["disabled"]));
            settings.totalQuestAddedCount += 1;
            if (settings.totalQuestAddedCount == 10) {
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", true);
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').attr("disabled", false);
            }
        } else {
            var checkedQuestLength = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').length;
            if (checkedQuestLength > 0) {
                settings.usePrevButtonModal.prop("disabled", false).removeClass(transformClass(["disabled"]));
            } else {
                settings.usePrevButtonModal.prop("disabled", true).addClass(transformClass(["disabled"]));
            }
            settings.totalQuestAddedCount -= 1;
            settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", false);
        }
        settings.usePrevQuestContainer.find('.' + transformClass(["totalQuestAdded"])).text("Your Added Questions: " + settings.totalQuestAddedCount + "/10");
    });
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-label"]), function (event) {
        event.stopPropagation();
    });
}

function deleteAddedQuestionRow(id) {
    settings.addedQuestContainer.find("." + transformClass(["section-row"]) + "[data-questionId=" + id + "]").remove();
}

function deletePrevUsedQuestionRow(id) {
    settings.usePrevQuestContainer.find("." + transformClass(["section-row"]) + "[data-questionId=" + id + "]").remove();
}

function showActionButtonContainer() {
    settings.actionButtonsContainer.removeClass("hidden");
}

function hideActionButtonContainer() {
    settings.actionButtonsContainer.addClass("hidden");
}

function updateTotalQuestionsAddedText(data) {
    settings.totalQuestAdded.text("Your Added Questions: " + data + "/10");
    settings.totalQuestAddedCount = data;
}

function hideAddedQuestionContainer() {
    settings.addedQuestContainer.addClass("hidden");
}

function hideUsePrevButton() {
    settings.usePrevButton.addClass("hidden");
    settings.actionButtonsContainer.find("." + transformClass(["or-text"])).addClass("hidden");
}
//
// export function updateTotalQuestionsAddedText()

// export function populatePreviousUsedQuestions(data) {
//     settings.usePrevQuestContainer.find("." + transformClass(["section-content"])).html(createUsePrevQuestSectionContent(data))
// }

function associateQuestionWithQuestionaire(questionaireId, sectionId, data, extraParameters) {
	return postRequest(baseUrl + "/v1/questionaire/" + questionaireId + "/section/" + sectionId + "/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
		if (res.status && res.status == 'success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("associatedQuestionWithQuestionaire", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToAssociateQuestionWithQuestionaire", res);
	});
}

function createQuestion(data, extraParameters) {
	return postRequest(baseUrl + "/v1/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
		if (res.status && res.status == 'success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("createdQuestion", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToCreateQuestion", res);
	});
}

function fetchQuestions(parameters) {
	return getRequest(baseUrl + "/v1/question", parameters, function (res) {
		if (res.status && res.status == 'success') {
			return pubsub.publish("fetchedQuestions", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToFetchQuestions", res);
	});
}

function createQuestionaire(data, extraParameters) {
	return postRequest(baseUrl + "/v1/questionaire", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
		if (res.status && res.status == 'success') {
			res.extraParameters = extraParameters;
			return pubsub.publish("createdQuestionaire", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToCreateQuestionaire", res);
	});
}

function fetchQuestionaire(parameters) {
	return getRequest(baseUrl + "/v1/questionaire", parameters, function (res) {
		if (res.status && res.status == 'success') {
			return pubsub.publish("fetchedQuestionaire", res);
		}
	}, function (res, status, error) {
		return pubsub.publish("failedToFetchQuestionaire", res);
	});
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function Assessment(config) {
    var options = {};
    // Define option defaults
    var defaults = {
        title: 'Screening Questions',
        subTitle: 'You can ask some questions before the candidates apply to your job!'

        // Create options by extending defaults with the passed in arugments
    };if (config && (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === "object") {
        options = extendDefaults(defaults, config);
    }

    var questionsParameters = {
        "author": options.author
    };

    if (!options.association) {
        $.when(null, fetchQuestions(questionsParameters)).then(function (a, b) {
            if (b[0] && b[0]["status"] == "success") {

                var questionRows = b[0]['data'];

                var data = {
                    "prevQuestions": questionRows,
                    "options": options
                };
                return pubsub.publish("fetchedQuestionaireDetails", data);
            }
        }, function (res, status, error) {
            return pubsub.publish("failedToFetchQuestionaireDetails", res);
        });
        return;
    }

    var questionaireParameters = {
        "association": options.association,
        "invocation": questionaireInvocation["screening"]
    };

    $.when(fetchQuestionaire(questionaireParameters), fetchQuestions(questionsParameters)).then(function (a, b) {
        if (a[0] && b[0] && a[0]["status"] == "success" && b[0]["status"] == "success") {

            var questionaireRows = a[0]['data'];
            var questionRows = b[0]['data'];

            var data = {
                "questionaire": questionaireRows,
                "prevQuestions": questionRows,
                "options": options
            };
            return pubsub.publish("fetchedQuestionaireDetails", data);
        }
    }, function (res, status, error) {
        return pubsub.publish("failedToFetchQuestionaireDetails", res);
    });
}

function onSuccessfullFetchedQuestionaireDetails(topic, data) {
    if (data.options) {
        globalParameters.options = data.options;
    }

    if (data.questionaire && data.questionaire.length) {
        globalParameters.questionaireId = data.questionaire[0]["id"];
        data.questionaire[0]["sections"][0]["questions"].forEach(function (aQuestion) {
            globalParameters.questionIds.push(aQuestion["id"]);
        });
    }

    if (data.prevQuestions.length) {
        var prevQuestions = [];
        data.prevQuestions.forEach(function (aPrevQuestion) {
            var index = globalParameters["questionIds"].indexOf(aPrevQuestion["id"]);
            if (index == -1) {
                prevQuestions.push(aPrevQuestion);
                globalParameters.prevQuestions[aPrevQuestion["id"]] = aPrevQuestion;
            }
        });
        data.prevQuestions = prevQuestions;
    }

    initialize(data);

    setSortableList(function (questionIds) {
        var data = {};
        data["questionIds"] = questionIds;

        var extraParameters = {};
        extraParameters.questionIds = questionIds;
        extraParameters.origin = "sortable";
        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters);
    });

    onClickUsePrevButtonModal(function (prevQuestionIds) {
        var data = {};
        data["questionIds"] = globalParameters.questionIds.concat(prevQuestionIds);

        var extraParameters = {};
        extraParameters.prevQuestionIds = prevQuestionIds;
        extraParameters.origin = "prevUsed";
        extraParameters.data = data;

        if (!globalParameters.questionaireId) {
            var questionaireData = {
                "author": globalParameters.options.author,
                "tags": globalParameters.options.tags,
                "authorType": globalParameters.options.authorType,
                "invocation": questionaireInvocation["screening"],
                "association": globalParameters.options.association,
                "sections": [{
                    "type": "static",
                    "questionIds": []
                }]
            };
            return createQuestionaire(questionaireData, extraParameters);
        }

        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters);
    });

    onClickAddQuestion(function (questionData) {
        var extraParameters = {};
        extraParameters.questionData = questionData;

        if (!globalParameters.questionaireId) {
            var questionaireData = {
                "author": globalParameters.options.author,
                "tags": globalParameters.options.tags,
                "authorType": globalParameters.options.authorType,
                "invocation": questionaireInvocation["screening"],
                "association": globalParameters.options.association,
                "sections": [{
                    "type": "static",
                    "questionIds": []
                }]
            };
            return createQuestionaire(questionaireData, extraParameters);
        }

        createQuestion(questionData, extraParameters);
    });

    onClickDeleteQuestion(function (id) {
        var data = {};
        data["questionIds"] = globalParameters.questionIds;
        var index = data["questionIds"].indexOf(id);
        if (index !== -1) {
            data["questionIds"].splice(index, 1);
        }
        var extraParameters = {};
        extraParameters.origin = "delete";
        extraParameters.questionId = id;
        associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters);
    });

    onClickEditQuestionModal(function (id) {
        return;
    });
}

function onFailFetchedQuestionaireDetails(topic, data) {}

var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails);
var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails);

function onSuccessfullCreateQuestionaire(topic, res) {
    globalParameters.questionaireId = res.data;
    var extraParameters = {};
    if (res.extraParameters.origin == "prevUsed") {
        var data = res.extraParameters.data;
        extraParameters.prevQuestionIds = res.extraParameters.prevQuestionIds;
        extraParameters.origin = "prevUsed";
        return associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters);
    }

    extraParameters.questionData = res.extraParameters.questionData;
    createQuestion(res.extraParameters.questionData, extraParameters);
}

function onFailCreateQuestionaire(topic, data) {}

var createdQuestionaireSuccessSubscription = pubsub.subscribe("createdQuestionaire", onSuccessfullCreateQuestionaire);
var createdQuestionaireFailSubscription = pubsub.subscribe("failedToCreateQuestionaire", onFailCreateQuestionaire);

function onSuccessfullCreateQuestion(topic, res) {
    var data = {};
    data["questionIds"] = globalParameters.questionIds.concat(res.data);
    var extraParameters = {};

    extraParameters.questionData = res.extraParameters.questionData;
    extraParameters.questionData["id"] = res.data;
    extraParameters.questionId = res.data;
    extraParameters.origin = "newlyAdded";
    associateQuestionWithQuestionaire(globalParameters.questionaireId, 0, data, extraParameters);
}

function onFailCreateQuestion(topic, data) {}

var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion);
var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion);

function onSuccessfullAssociateQuestionWithQuestionaire(topic, res) {

    if (res.extraParameters.origin == "delete") {
        var index = globalParameters.questionIds.indexOf(res.extraParameters.questionId);
        if (index !== -1) {
            globalParameters.questionIds.splice(index, 1);
        }
        if (globalParameters.questionIds.length < 10) {
            showActionButtonContainer();
        }
        if (globalParameters.questionIds.length == 0) {
            hideAddedQuestionContainer();
        }
        updateTotalQuestionsAddedText(globalParameters.questionIds.length);
        return deleteAddedQuestionRow(res.extraParameters.questionId);
    }

    if (res.extraParameters.origin == "sortable") {
        return alert("successfully sorted");
    }

    var questionsToAppend = [];
    if (res.extraParameters.origin == "prevUsed") {
        globalParameters.questionIds = globalParameters.questionIds.concat(res.extraParameters.prevQuestionIds);
        res.extraParameters.prevQuestionIds.forEach(function (aPrevQuestionId) {
            questionsToAppend.push(globalParameters.prevQuestions[aPrevQuestionId]);
            deletePrevUsedQuestionRow(aPrevQuestionId);
            delete globalParameters.prevQuestions[aPrevQuestionId];
        });

        if (Object.keys(globalParameters.prevQuestions).length === 0 && globalParameters.prevQuestions.constructor === Object) {
            hideUsePrevButton();
        }
    }
    if (res.extraParameters.origin == "newlyAdded") {
        globalParameters.questionIds = globalParameters.questionIds.concat(res.extraParameters.questionId);
        questionsToAppend.push(res.extraParameters.questionData);
    }

    updateTotalQuestionsAddedText(globalParameters.questionIds.length);
    appendQuestionsAdded(questionsToAppend);
    if (globalParameters.questionIds.length >= 10) {
        hideActionButtonContainer();
    }
    closeContainer();
}

function onFailAssociateQuestionWithQuestionaire(topic, data) {}

var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire);
var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire);

return Assessment;

}());
//# sourceMappingURL=bundle.js.map
