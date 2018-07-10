var assessmentSdk = (function () {
    'use strict';

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

    function createSelectDropdown(options, id) {
        var select = createElement("select", ["select-dropdown"]);
        var optionRowStr = '';
        options.forEach(function (anOption) {
            var optionRow = createElement("option", ["option-row"], id).attr({ "value": anOption["value"] }).text(anOption["text"]);
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

    function createTextarea(n) {
        if (!n) return;

        var i;
        var textareaStr = '';
        for (i = 0; i < n; i++) {
            var textarea = createElement("textarea", ["textarea", "small", "optionsTextarea"]).attr({
                "placeholder": "Option " + (i + 1) + ""
            });        textareaStr += textarea[0].outerHTML;
        }
        return textareaStr;
    }

    var settings = {};

    function initialize(options) {

        settings.totalQuestAddedCount = 0;
        settings.options = options;

        var wrapper = createElement("div", ["wrapper"]);
        wrapper.html(createWrapperContent());

        $("#" + settings.options.wrapperName).html(wrapper[0].outerHTML);

        settings.addQuestContainer = $("#" + transformId("addQuestContainer"));
        settings.usePrevQuestContainer = $("#" + transformId("usePrevQuestContainer"));
        settings.usePrevButton = $("#" + transformId("usePrevButton"));
        settings.addQuestButton = $("#" + transformId("addQuestButton"));
        settings.addQuestButtonModal = $("#" + transformId("addQuestButtonModal"));
        settings.questionTextarea = $("#" + transformId("questionTextarea"));
        settings.questionType = $("#" + transformId("questionType"));
        settings.usePrevButtonModal = $("#" + transformId("usePrevButtonModal"));

        settings.optionsTextarea = $("." + transformClass(["optionsTextarea"]));
        settings.totalQuestAdded = $("." + transformClass(["totalQuestAdded"]));

        settings.addQuesButton.click(function (e) {
            e.stopPropagation();
            settings.addQuestContainer.removeClass("hidden");
        });

        $("body").click(function () {
            closeContainer();
        });

        $("." + transformClass(["container"])).click(function (event) {
            event.stopPropagation();
        });

        $("." + transformClass(["cancel-button"])).click(function (event) {
            event.stopPropagation();
            closeContainer();
        });

        onClickPrevQuestCheckboxModal();

        toggleSlideOptions(settings.usePrevQuestContainer);

        onClickUsePrevButton();
    }

    function onClickUsePrevButton() {
        settings.usePrevButton.click(function (e) {
            e.stopPropagation();
            settings.usePrevQuestContainer.removeClass("hidden");
        });
    }

    function onClickSaveQuestion(fn) {
        settings.addQuestButtonModal.click(function (e) {
            e.stopPropagation();
            var data = {};
            data["question"] = settings.questionTextarea.val();
            data["type"] = settings.questionType.val();
            var ansOptions = [];
            $.each(settings.optionsTextarea, function (index, anOption) {
                ansOptions.push($(anOption).val());
            });
            data["ansOptions"] = ansOptions;
            data["author"] = settings.options.author;

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
        var text = createElement("span", ["or-text"]).text("or");
        var usePrevButton = createElement("button", ["button"], "usePrevButton").text(settings.options["usePrevButtonText"]).addClass("hidden");
        var addQuesButton = createElement("button", ["button"], "addQuesButton").text(settings.options["addQuesButtonText"]);

        var addQuestContainer = createElement("div", ["container", "addQuestContainer"], "addQuestContainer").addClass("hidden");
        addQuestContainer.html(createAddQuestContainer());

        var usePrevQuestContainer = createElement("div", ["container", "usePrevQuestContainer"], "usePrevQuestContainer").addClass("hidden");
        usePrevQuestContainer.html(createUsePrevQuestContainer());

        actionButtonsCont.html(addQuesButton[0].outerHTML + text[0].outerHTML + usePrevButton[0].outerHTML + addQuestContainer[0].outerHTML + usePrevQuestContainer[0].outerHTML);

        return heading[0].outerHTML + subHeading[0].outerHTML + actionButtonsCont[0].outerHTML;
    }

    function createAddQuestContainer() {
        var sectionHeader = createElement("div", ["section-header"]);
        var selectDropdown = createSelectDropdown(questionTypeOptions, "questionType");
        var checkbox = createCheckbox("addQuestionHeader-isQuestMandatory", null, null, null, "Mandatory");
        sectionHeader.html(selectDropdown + checkbox);
        var sectionContent = createElement("div", ["section-content"]);
        sectionContent.html(createAddQuestSectionContent("multi"));
        return sectionHeader[0].outerHTML + sectionContent[0].outerHTML;
    }

    function createUsePrevQuestContainer() {
        var sectionHeading = createElement("div", ["section-heading"]).text(settings.options["prevQuestContainerHeading"]);
        var sectionContent = createElement("div", ["section-content"]);
        var sectionFooter = createElement("div", ["section-footer"]);
        var addButton = createElement("button", ["button"], "usePrevButtonModal").text("Add selected questions");
        var cancelButton = createElement("button", ["button", "cancel-button"]).text("Cancel");
        var totalQuestionsAdded = createElement("div", ["quest-added-text", "totalQuestAdded"]).text("Questions added: 0/10");
        sectionFooter.html(addButton[0].outerHTML + cancelButton[0].outerHTML + totalQuestionsAdded[0].outerHTML);

        return sectionHeading[0].outerHTML + sectionContent[0].outerHTML + sectionFooter[0].outerHTML;
    }

    function createAddQuestSectionContent(questionType) {
        var questionText = createElement("div", ["text"]).text("Question Text");
        var questionTextarea = createElement("textarea", ["textarea"], "questionTextarea").attr({ "placeholder": "What would you like to ask?" });

        var addQuestButton = createElement("button", ["button"], "addQuestButtonModal").text("Save");
        var cancelButton = createElement("button", ["button", "borderLess-button", "cancel-button"]).text("Cancel");

        if (["multi", "single"].indexOf(questionType) != -1) {
            var optionsWrapper = createElement("div", ["options-wrapper"]);
            var optionTextArea = createTextarea(2);
            var addOptionButton = createElement("button", ["button", "borderLess-button", "add-option"]).text("Add");
            optionsWrapper.html(optionTextArea + addOptionButton[0].outerHTML);
            return questionText[0].outerHTML + questionTextarea[0].outerHTML + optionsWrapper[0].outerHTML + addQuestButton[0].outerHTML + cancelButton[0].outerHTML;
        }
        return questionText[0].outerHTML + questionTextarea[0].outerHTML + addQuestButton[0].outerHTML + cancelButton[0].outerHTML;
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

    function associateQuestionWithQuestionaire(questionaireId, sectionId, data, extraParameters) {
    	return postRequest(sdkbaseUrl + "/v1/questionaire/" + questionaireId + "/section/" + sectionId + "/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
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
    	return postRequest(sdkbaseUrl + "/v1/question", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
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
    	return getRequest(sdkbaseUrl + "/v1/question", parameters, function (res) {
    		if (res.status && res.status == 'success') {
    			return pubsub.publish("fetchedQuestions", res);
    		}
    	}, function (res, status, error) {
    		return pubsub.publish("failedToFetchQuestions", res);
    	});
    }

    function createQuestionaire(data, extraParameters) {
    	return postRequest(sdkbaseUrl + "/v1/questionaire", { "content-type": "application/json" }, JSON.stringify(data), function (res, status, xhr) {
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
    	return getRequest(sdkbaseUrl + "/v1/questionaire", parameters, function (res) {
    		if (res.status && res.status == 'success') {
    			return pubsub.publish("fetchedQuestionaire", res);
    		}
    	}, function (res, status, error) {
    		return pubsub.publish("failedToFetchQuestionaire", res);
    	});
    }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Assessment = function Assessment(options) {
        _classCallCheck(this, Assessment);

        this.title = options.title || 'Screening Questions';
        this.subTitle = options.subTitle || 'You can ask some questions before the candidates apply to your job!';
        this.author = options.author || Error('I was created using a function call!');
        this.association = options.association || Error('I was created using a function call!');

        return;

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
                    "questions": questionRows
                };

                return pubsub.publish("fetchedQuestionaireDetails", data);
            }
        }, function (res, status, error) {
            return pubsub.publish("failedToFetchQuestionaireDetails", res);
        });

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
            questions[res.data] = res.extraParameters.questionData;
            var data = {};
            data["questions"] = Object.keys(questions);
            associateQuestionWithQuestionaire(res.extraParameters.questionaireId, 0, data, {});
        }

        function onFailCreateQuestion(topic, data) {}

        var createdQuestionSuccessSubscription = pubsub.subscribe("createdQuestion", onSuccessfullCreateQuestion);
        var createdQuestionFailSubscription = pubsub.subscribe("failedToCreateQuestion", onFailCreateQuestion);

        function onSuccessfullAssociateQuestionWithQuestionaire(topic, res) {
            alert(res.message);
            // questionIds.push(res.data);
            // associateQuestionWithQuestionaire(questionIds)
        }

        function onFailAssociateQuestionWithQuestionaire(topic, data) {}

        var associatedQuestionWithQuestionaireSuccessSubscription = pubsub.subscribe("associatedQuestionWithQuestionaire", onSuccessfullAssociateQuestionWithQuestionaire);
        var associatedQuestionWithQuestionaireFailSubscription = pubsub.subscribe("failedToAssociateQuestionWithQuestionaire", onFailAssociateQuestionWithQuestionaire);

        function onSuccessfullFetchedQuestionaireDetails(topic, res) {
            var data = res.data;
            console.log(this.options);
            return;
            options.responseData = data;

            initialize(options);

            onClickUsePrevButtonModal(function () {
                console.log("hi");
            });

            onClickSaveQuestion(function (questionData) {
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
                var extraParameters = {};
                extraParameters.questionData = questionData;
                createQuestionaire(questionaireData, extraParameters);
            });
        }

        function onFailFetchedQuestionaireDetails(topic, data) {}

        var fetchedQuestionaireDetailsSuccessSubscription = pubsub.subscribe("fetchedQuestionaireDetails", onSuccessfullFetchedQuestionaireDetails);
        var fetchedQuestionaireDetailsFailSubscription = pubsub.subscribe("failedToFetchQuestionaireDetails", onFailFetchedQuestionaireDetails);
    };

    return Assessment;

}());

//# sourceMappingURL=bundle/bundle.js.map
