export function transformClass(classNameArr) {
    var classNameStr = ''
    var transformedArr = []
    classNameArr.forEach(function(className) {
        className = pluginName + className
        transformedArr.push(className)
    });
    classNameStr = transformedArr.join(" ")
    return classNameStr
}

export function transformId(id) {
    return pluginName + id
}

export function createElement(elem, classNameArr, id) {
    var domElem = $("<" + elem + "></" + elem + ">")
    if (classNameArr && classNameArr.length) {
        domElem.addClass(transformClass(classNameArr))
    }
    if (id) {
        domElem.attr("id", transformId(id))
    }
    return domElem
}

export function createCheckbox(id, name, value, dataLabel, text) {
    var checkboxWrapper = createElement("div", ["checkbox-wrapper"]);

    var input = createElement("input", ["checkbox-input"]).attr({"id": id, "type": "checkbox", "name": name, "value": value, "data-label": dataLabel})
    var label = createElement("label", ["checkbox-label"]).attr({"for": id}).text(text)

    checkboxWrapper.html(input[0].outerHTML + label[0].outerHTML)
    return checkboxWrapper[0].outerHTML
}

export function createSlideDropDown(options) {
    var slideWrapper = createElement("div", ["slide-wrapper"]);
    var toggleButton = createElement("div", ["slide-toggle-button"]).text("view options");
    var optionsWrapper = createElement("div", ["options-wrapper"])
    var optionRowStr = ''

    options.forEach(function(anOption) {
        var optionRow = createElement("div", ["option-row"]).text(anOption);
        optionRowStr += optionRow[0].outerHTML
    });
    optionsWrapper.html(optionRowStr)
    slideWrapper.html(toggleButton[0].outerHTML + optionsWrapper[0].outerHTML)
    return slideWrapper[0].outerHTML
}

export function createSelectDropdown(options, id) {
    var select = createElement("select", ["select-dropdown"]);
    var optionRowStr = ''
    options.forEach(function(anOption) {
        var optionRow = createElement("option", ["option-row"], id).attr({"value": anOption["value"]}).text(anOption["text"])
        optionRowStr += optionRow[0].outerHTML
    });
    select.html(optionRowStr)
    return select[0].outerHTML
}

export function toggleSlideOptions(elem) {
    elem.on('click', '.' + transformClass(["slide-toggle-button"]), function(event) {
        event.stopPropagation()
        $(this).next().slideToggle();
    })
}

export function closeContainer() {
    $("." + transformClass(["container"])).addClass("hidden")
}

export function createTextarea(n) {
    if (!n)
        return

    var i;
    var textareaStr = ''
    for (i = 0; i < n; i++) {
        var textarea = createElement("textarea", ["textarea", "small", "optionsTextarea"]).attr({
            "placeholder": "Option " + (
            i + 1) + ""
        });;
        textareaStr += textarea[0].outerHTML
    }
    return textareaStr
}
