var AptiTalk = AptiTalk || {};

AptiTalk.AutoComplete = function () {
    function split(val) {
        return val.split(/#\s*/);
    }

    function extractLast(term) {
        return split(term).pop();
    }

    function keyDown(event) {
        // don't navigate away from the field on tab when selecting an item
        if (event.keyCode === $.ui.keyCode.TAB &&
            $(this).autocomplete("instance").menu.active) {
            event.preventDefault();
        }
    }

    function autoComplete() {
        return {
            source: function (request, response) {
                $.getJSON("/hashtags/autocomplete/" + extractLast(request.term), response);
            },
            search: function () {
                // custom minLength
                var term = extractLast(this.value);
                if (term.startsWith('#')) {
                    return false;
                }

                if (term.length < 2) {
                    return false;
                }
            },
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                var terms = split(this.value);
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push(ui.item.value);
                // add placeholder to get the comma-and-space at the end
                this.value = terms.join("#") + " ";

                return false;
            }
        };
    }

    this.bindControls = function () {
        $(".reply-input")
            .bind("keydown", keyDown)
            .autocomplete(autoComplete());

        $("#input-primary")
            .bind("keydown", keyDown)
            .autocomplete(autoComplete());
    };
};
