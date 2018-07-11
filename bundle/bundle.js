var assessmentSdk = (function () {
    'use strict';

    var pluginName = "my-plugin-";
    var settings = {};
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

    function createSelectDropdown(options, id) {
        var select = createElement("select", ["select-dropdown"], id);
        var optionRowStr = '';
        options.forEach(function (anOption) {
            var optionRow = createElement("option", ["option-row"]).attr({
                "value": anOption["value"],
                "data-label": anOption["data-label"]
            }).text(anOption["text"]);
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

    function closeContainer() {
        $("." + transformClass(["container"])).addClass("hidden");
    }

    function createTextarea(n, offset) {
        if (!n) return;

        var j = offset || 0;
        var i;
        var textareaStr = '';
        for (i = 0; i < n; i++) {
            var optionsTextareaWrapper = createElement("div", ["options-textarea-wrapper"]);
            var textarea = createElement("textarea", ["textarea", "small", "optionsTextarea"]).attr({
                "placeholder": "Option " + (j + 1)
            });
            j++;
            var cancelButton = createElement("span", ["cross-button", "deleteOptionButton"]).addClass("hidden");
            optionsTextareaWrapper.html(textarea[0].outerHTML + cancelButton[0].outerHTML);

            textareaStr += optionsTextareaWrapper[0].outerHTML;
        }
        return textareaStr;
    }

    function initialize(data) {
        settings.totalQuestAddedCount = data.questionaire[0]["sections"][0]["questions"].length;
        settings.options = data.options;
        settings.prevQuestions = data.prevQuestions;

        var wrapper = createElement("div", ["wrapper"]);
        wrapper.html(createWrapperContent());

        $("#container").html(wrapper[0].outerHTML);

        settings.addQuestContainer = $("#" + transformId("addQuestContainer"));
        settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"));
        settings.usePrevButton = $("#" + transformId("usePrevButton"));
        settings.addQuestButton = $("#" + transformId("addQuestButton"));
        settings.addQuestButtonModal = $("#" + transformId("addQuestButtonModal"));
        settings.questionTextarea = $("#" + transformId("questionTextarea"));
        settings.questionType = $("#" + transformId("questionType"));
        settings.usePrevButtonModal = $("#" + transformId("usePrevButtonModal"));
        settings.questMandatory = $("#" + transformId("addQuestionHeader-isQuestMandatory"));
        settings.addQuestOptionButton = $("#" + transformId("addQuestOptionButton"));

        settings.optionsTextarea = $("." + transformClass(["optionsTextarea"]));
        settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]));

        updateTotalQuestionsAddedText();

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

        onClickPrevQuestCheckboxModal();

        toggleSlideOptions(settings.usePrevQuestContainer);

        onClickUsePrevButton();

        onClickAddQuestOption();

        onChangeQuestType();

        onClickDeleteQuestOption();
    }

    function onClickDeleteQuestOption() {
        settings.addQuestContainer.on('click', "." + transformClass(["deleteOptionButton"]), function (e) {
            $(this).parent().remove();
            var optionsLength = settings.addQuestContainer.find(".my-plugin-optionsTextarea").length;
            if (optionsLength <= 2) {
                settings.addQuestContainer.find('.' + transformClass(["deleteOptionButton"])).addClass("hidden");
            }
        });
    }

    function onChangeQuestType() {
        settings.questionType.change(function (e) {
            var type = $(this).find('option:selected').attr("data-label");
            settings.addQuestContainer.find("." + transformClass(["section-content"])).html(createAddQuestSectionContent(type));
        });
    }

    function onClickAddQuestOption() {
        settings.addQuestOptionButton.click(function (e) {
            e.stopPropagation();
            var optionsLength = settings.addQuestContainer.find(".my-plugin-optionsTextarea").length;
            settings.addQuestContainer.find("." + transformClass(["options-wrapper"])).append(createTextarea(1, optionsLength));
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
            data["question"] = settings.questionTextarea.val();
            data["type"] = settings.questionType.val();
            var ansOptions = [];
            $.each(settings.optionsTextarea, function (index, anOption) {
                ansOptions.push($(anOption).val());
            });
            data["answerOptions"] = ansOptions;
            data["author"] = settings.options.author;
            data["mandatory"] = settings.questMandatory.is(":checked");

            fn(data);
        });
    }

    function onClickUsePrevButtonModal(fn) {
        settings.usePrevButtonModal.click(function (event) {
            event.stopPropagation();
            fn();
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

        // var addedQuestContainer = createElement("div", ["added-quest-container"], "addedQuestContainer")
        // addedQuestContainer.html(createAddedQuestContainer())

        var actionButtonsCont = createElement("div", ["action-button-container"]);
        var addQuestButton = createElement("button", ["button"], "addQuestButton").text("Add Question");

        var addQuestContainer = createElement("div", ["container", "addQuestContainer"], "addQuestContainer").addClass("hidden");
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

        return heading[0].outerHTML + subHeading[0].outerHTML + actionButtonsCont[0].outerHTML;
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
        sectionContent.html(createAddQuestSectionContent("multi"));

        var sectionFooter = createElement("div", ["section-footer"]);
        var addButton = createElement("button", ["button"], "addQuestButtonModal").text("Add");
        var cancelButton = createElement("button", ["button", "borderLess-button", "cancel-container-button"]).text("Cancel");
        sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML);

        return sectionHeader[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
    }

    function createUsePrevQuestContainer(data) {
        var sectionHeading = createElement("div", ["section-heading"]).text("Use previously added question");
        var sectionContent = createElement("div", ["section-content"]);
        sectionContent.html(createUsePrevQuestSectionContent(data));
        var sectionFooter = createElement("div", ["section-footer"]);
        var addButton = createElement("button", ["button"], "usePrevButtonModal").text("Add selected questions");
        var cancelButton = createElement("button", ["button", "borderLess-button",, "cancel-container-button"]).text("Cancel");
        var totalQuestionsAdded = createElement("div", ["quest-added-text", "totalQuestAdded"]).text("Questions added: 0/10");
        sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML);

        return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
    }

    function createUsePrevQuestSectionContent(data) {
        var sectionRowStr = '';
        data.forEach(function (aQuestion) {
            var sectionRow = createElement("div", ["section-row"]);
            var checkbox = createCheckbox("addQuestSectionRow" + aQuestion["id"], null, aQuestion["id"], null, aQuestion["question"]);
            if (aQuestion["answerOptions"].length) {
                var slideDropdown = createSlideDropDown(aQuestion["answerOptions"]);
            }

            sectionRow.html(checkbox + slideDropdown);
            sectionRowStr += sectionRow[0].outerHTML;
        });

        return sectionRowStr;
    }

    function createAddQuestSectionContent(questionType) {
        var questionText = createElement("div", ["text"]).text("Question Text");
        var questionTextarea = createElement("textarea", ["textarea"], "questionTextarea").attr({ "placeholder": "What would you like to ask?" });

        if (["multi", "single"].indexOf(questionType) != -1) {
            var optionsWrapper = createElement("div", ["options-wrapper"]);
            var optionTextArea = createTextarea(2, 0);
            var addOptionButton = createElement("button", ["button", "borderLess-button", "add-quest-option"], "addQuestOptionButton").text("Add");
            optionsWrapper.html(optionTextArea);
            return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + addOptionButton[0].outerHTML;
        }

        return questionText[0].outerHTML + questionTextarea[0].outerHTML;
    }

    function onClickPrevQuestCheckboxModal() {
        settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-input"]), function (event) {
            event.stopPropagation();
            if ($(this).is(":checked")) {
                settings.totalQuestAddedCount += 1;
                updateTotalQuestionsAddedText();
                if (settings.totalQuestAddedCount == 10) {
                    settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", true);
                    settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked').attr("disabled", false);
                }
                // var el = settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"]) + ':checked')
                // console.log(el)
            } else {
                settings.totalQuestAddedCount -= 1;
                updateTotalQuestionsAddedText();
                settings.usePrevQuestContainer.find('.' + transformClass(["checkbox-input"])).attr("disabled", false);
            }
        });
        settings.usePrevQuestContainer.on('click', '.' + transformClass(["checkbox-label"]), function (event) {
            event.stopPropagation();
        });
    }

    function updateTotalQuestionsAddedText() {
        settings.totalQuestAdded.text("Questions added: " + settings.totalQuestAddedCount + "/10");
    }

    // export function populatePreviousUsedQuestions(data) {
    //     settings.usePrevQuestContainer.find("." + transformClass(["section-content"])).html(createUsePrevQuestSectionContent(data))
    // }

    function associateQuestionWithQuestionaire(questionaireId, sectionId, data, extraParameters) {
    	return postRequest(baseUrl + "/v1/questionaire/" + questionaireId + "/section/" + sectionId + "/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
    		if (res.status && res.status == 'success') {
    			// res.extraParameters = {}
    			// res.extraParameters["questionaireId"] = extraParameters.questionaireId
    			return pubsub.publish("associatedQuestionWithQuestionaire", res);
    		}
    	}, function (res, status, error) {
    		return pubsub.publish("failedToAssociateQuestionWithQuestionaire", res);
    	});
    }

    function createQuestion(data, extraParameters) {
    	return postRequest(baseUrl + "/v1/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
    		if (res.status && res.status == 'success') {
    			res.extraParameters = {};
    			res.extraParameters["questionaireId"] = extraParameters.questionaireId;
    			res.extraParameters["questionData"] = extraParameters.questionData;
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
    			res.extraParameters = {};
    			res.extraParameters["questionData"] = extraParameters.questionData;
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

    var globalParameters = {
        questionaireId: null,
        questions: {}
    };

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

        var questionaireParameters = {
            "association": options.association,
            "invocation": questionaireInvocation["screening"]
        };

        var questionsParameters = {
            "author": options.author
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
        if (data.questionaire.length) {
            globalParameters.questionaireId = data.questionaire[0]["id"];
            data.questionaire[0]["sections"][0]["questions"].forEach(function (aQuestion) {
                globalParameters.questions[aQuestion["id"]] = aQuestion;
            });
        }

        initialize(data);

        // model.onClick

        onClickUsePrevButtonModal(function () {
            console.log("hi");
        });

        onClickAddQuestion(function (questionData) {
            if (!globalParameters.questionaireId) {
                var questionaireData = {
                    "author": data.options.author,
                    "tags": data.options.tags,
                    "authorType": data.options.authorType,
                    "invocation": questionaireInvocation["screening"],
                    "association": data.options.association,
                    "sections": [{
                        "type": "static",
                        "questionIds": []
                    }]
                };
                var extraParameters = {};
                extraParameters.questionData = questionData;
                return createQuestionaire(questionaireData, extraParameters);
            }

            var extraParameters = {};
            extraParameters.questionaireId = globalParameters.questionaireId;
            extraParameters.questionData = questionData;
            createQuestion(questionData, extraParameters);
        });
    }

    function onFailFetchedQuestionaireDetails(topic, data) {}

    var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails);
    var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails);

    function onSuccessfullCreateQuestionaire(topic, res) {
        var extraParameters = {};
        extraParameters.questionaireId = res.data;
        extraParameters.questionData = res.extraParameters.questionData;
        createQuestion(res.extraParameters.questionData, extraParameters);
    }

    function onFailCreateQuestionaire(topic, data) {}

    var createdQuestionaireSuccessSubscription = pubsub.subscribe("createdQuestionaire", onSuccessfullCreateQuestionaire);
    var createdQuestionaireFailSubscription = pubsub.subscribe("failedToCreateQuestionaire", onFailCreateQuestionaire);

    function onSuccessfullCreateQuestion(topic, res) {
        globalParameters.questions[res.data] = res.extraParameters.questionData;
        var data = {};
        data["questionIds"] = Object.keys(globalParameters.questions);
        associateQuestionWithQuestionaire(res.extraParameters.questionaireId, 0, data, {});
    }

    function onFailCreateQuestion(topic, data) {}

    var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion);
    var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion);

    function onSuccessfullAssociateQuestionWithQuestionaire(topic, res) {
        closeContainer();
        alert(res.message);
    }

    function onFailAssociateQuestionWithQuestionaire(topic, data) {}

    var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire);
    var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire);

    return Assessment;

}());

//# sourceMappingURL=bundle/bundle.js.map
