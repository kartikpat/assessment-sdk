var settings = {}

function initialize(options) {
    settings.totalQuestAddedCount = 0;
    settings.options = options

    var wrapper = createElement("div", ["wrapper"]);
    wrapper.html(createWrapperContent());

    $("#" + settings.options.wrapperName).html(wrapper[0].outerHTML)

    settings.addQuestContainer = $("#" + transformId("addQuestContainer"))
    settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"))
    settings.usePrevButton = $("#" + transformId("usePrevButton"))
    settings.addQuesButton = $("#" + transformId("addQuesButton"))
    settings.saveQuestionButton = $("#" + transformId("saveQuestionButton"))
    settings.questionTextarea = $("#" + transformId("questionTextarea"))
    settings.questionType = $("#" + transformId("questionType"))

    settings.optionsTextarea = $("." + transformClass(["optionsTextarea"]))
    settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]))

    settings.addQuesButton.click(function(e){
        e.stopPropagation()
        settings.addQuestContainer.removeClass("hidden")
    })

    $("body").click(function(){
        closeContainer()
    })

    $("." + transformClass(["container"])).click(function(event){
        event.stopPropagation()
    })

    $("." + transformClass(["cancel-button"])).click(function(event){
        event.stopPropagation()
        closeContainer()
    })

    onClickPrevQuestCheckbox()

    toggleSlideOptions()

}

function onClickUsePrevButton(fn) {
    settings.usePrevButton.click(function(e) {
        e.stopPropagation()
        settings.usePrevQuestContainer.removeClass("hidden")
        fn()
    })
}

function onClickSaveQuestion(fn) {
    settings.saveQuestionButton.click(function(e) {
        e.stopPropagation()
        var data = {}
        data["question"] = settings.questionTextarea.val()
        data["type"] = settings.questionType.val()
        var ansOptions = []
        $.each(settings.optionsTextarea, function(index, anOption) {
            ansOptions.push($(anOption).val())
        })
        data["ansOptions"] = ansOptions
        data["author"] = settings.options.author

        fn(data)
    })
}

function onClickAddUsePrevButton(fn) {
    $("#" + transformId("addUsePrevButton")).click(function(event){
        event.stopPropagation()
        console.log("clicked")
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
    var text = createElement("span", ["or-text"]).text("or")
    var usePrevButton = createElement("button", ["button"], "usePrevButton").text(settings.options["usePrevButtonText"]).addClass("hidden");
    var addQuesButton = createElement("button", ["button"], "addQuesButton").text(settings.options["addQuesButtonText"])

    var addQuestContainer = createElement("div", ["container", "addQuestContainer"], "addQuestContainer").addClass("hidden")
    addQuestContainer.html(createAddQuestContainer())

    var usePrevQuestContainer = createElement("div", ["container", "usePrevQuestContainer"], "usePrevQuestContainer").addClass("hidden");
    usePrevQuestContainer.html(createUsePrevQuestContainer())

    actionButtonsCont.html(addQuesButton[0].outerHTML + text[0].outerHTML + usePrevButton[0].outerHTML  + addQuestContainer[0].outerHTML + usePrevQuestContainer[0].outerHTML)

    return heading[0].outerHTML + subHeading[0].outerHTML + actionButtonsCont[0].outerHTML
}

function createAddedQuestContainer() {
    var heading = createElement("div", ["heading"]);
    var questionsContent = createElement("div", ["content"]);
    questionsContent.html(createQuestionsContent())
    var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
    var checkbox = createCheckbox("addQuestionHeader-isQuestMandatory",null ,null, null,"Mandatory");
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createAddQuestSectionContent("multi"))
    return sectionHeader[0].outerHTML + sectionContent[0].outerHTML
}

function createQuestionsContent() {

}

function createAddQuestContainer() {
    var sectionHeader = createElement("div", ["section-header"]);
    var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
    var checkbox = createCheckbox("addQuestionHeader-isQuestMandatory",null ,null, null,"Mandatory");
    sectionHeader.html(selectDropdown + checkbox);
    var sectionContent = createElement("div", ["section-content"]);
    sectionContent.html(createAddQuestSectionContent("multi"))
    return sectionHeader[0].outerHTML + sectionContent[0].outerHTML
}

function createUsePrevQuestContainer() {
    var sectionHeading = createElement("div", ["section-heading"]).text(settings.options["prevQuestContainerHeading"]);
    var sectionContent = createElement("div", ["section-content"]);
    var sectionFooter = createElement("div", ["section-footer"]);
    var addButton = createElement("button", ["button"],"addUsePrevButton").text("Add selected questions");
    var cancelButton = createElement("button", ["button","cancel-button"]).text("Cancel");
    var totalQuestionsAdded = createElement("div", ["quest-added-text","totalQuestAdded"]).text("Questions added: 0/10")
    sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML)

    return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML
}

function createUsePrevQuestSectionContent(data) {
    var sectionRowStr = ''
    data.forEach(function(aQuestion) {
        var sectionRow = createElement("div", ["section-row"]);
        var checkbox = createCheckbox("addQuestSectionRow" + aQuestion["id"],null ,aQuestion["id"], null, aQuestion["question"]);
        if(aQuestion["ansOptions"].length) {
            var slideDropdown = createSlideDropDown(aQuestion["ansOptions"])
        }

        sectionRow.html(checkbox + slideDropdown)
        sectionRowStr += sectionRow[0].outerHTML

    });

    return sectionRowStr;
}

function createAddQuestSectionContent(questionType) {
    var questionText = createElement("div", ["text"]).text("Question Text");
    var questionTextarea = createElement("textarea", ["textarea"],"questionTextarea").attr({
        "placeholder": "What would you like to ask?"
    });

    var saveButton = createElement("button", ["button"],"saveQuestionButton").text("Save");
    var cancelButton = createElement("button", ["button","blue-button","cancel-button"]).text("Cancel");
    if(["multi", "single"].indexOf(questionType) != -1) {
        var optionsWrapper = createElement("div", ["options-wrapper"]);
        var optionTextArea = createTextarea(2)
        var addButton = createElement("button", ["button","blue-button"]).text("Add");
        optionsWrapper.html(optionTextArea + addButton[0].outerHTML)
        return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + saveButton[0].outerHTML + cancelButton[0].outerHTML;
    }
    return questionText[0].outerHTML + questionTextarea[0].outerHTML + saveButton[0].outerHTML + cancelButton[0].outerHTML;
}

function onClickPrevQuestCheckbox() {
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-input"]), function(event){
        event.stopPropagation()
        if($(this).is(":checked")) {
            settings.totalQuestAddedCount += 1;
            updateTotalQuestionsAddedText()
            if(settings.totalQuestAddedCount == 10) {
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", true);
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').attr("disabled", false);
            }
            // var el = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked')
            // console.log(el)
        }
        else {
            settings.totalQuestAddedCount -= 1;
            updateTotalQuestionsAddedText()
            settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", false);
        }
    })
    settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-label"]), function(event){
        event.stopPropagation()
    })
}

function updateTotalQuestionsAddedText() {
    settings.totalQuestAdded.text("Questions added: "+settings.totalQuestAddedCount+"/10")
}

function openAddQuestionModal() {
    debugger
}

function populatePreviousUsedQuestions(data) {
    settings.usePrevQuestContainer.find("." + transformClass(["section-content"])).html(createUsePrevQuestSectionContent(data))
}
