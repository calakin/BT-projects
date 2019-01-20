//validate empty inputs
validate = function () {
    if (!$("#inputSuggestion").val()) {
        $("#emptySuggestionWarning").show();
    } else {
        $("#addCardForm").invisible();
        $("#validSubmit").invisible();
        $("#cardSubmitted").show();
    }
};

//make the modal draggable
$("#editCardModal").draggable({
    handle: ".modal-header"
});
//keep track of the modal's original position
$("#editCardModal").data({
    'originalLeft': $("#editCardModal").css('left'),
    'origionalTop': $("#editCardModal").css('top')
});

function resetModalPosition() {
    $("#editCardModal").css({
        'left': $("#editCardModal").data('originalLeft'),
        'top': $("#editCardModal").data('origionalTop')
    });
}

//Submit Form
function SubmitForm(formId) {
    alert("SubmitForm");
    var oForm = document.getElementById(formId);
    if (oForm) {
        oForm.submit();
    }
    else {
        alert("DEBUG - could not find element " + formId);
    }
}

var ViewModel = function () {
    var self = this;
    var cardsUri = '/api/cards/';

    /* 
     * 
     *          START OF BRENDAN'S CODE
     * 
     * */

    suggestorList = ["Builder", "Salesperson", "Engineer", "QA Person", "Customer Success Rep"];
    self.suggestors = ko.observableArray(suggestorList);

    departmentList = ["Unassigned", "Sales", "Engineering", "QA", "Customer Success"];
    self.departments = ko.observableArray(departmentList);

    stageList = ["Scrap", "New Submissions", "Submission Review", "Add Support", "Discovery Meeting", "Initial Scoring", "Create Implementation Options & Add Scope", "Scope Review", "Requirement Complexity Scoring", "Implementation Decisions & Vetted Score", "Scoring Review Meeting", "Product Breakdown", "Spec Review Meeting", "Complexity Meeting", "Sent to Development"];
    self.stage = ko.observableArray(stageList);

    teamList = ["Unassigned", "Team1", "Team2", "Team3", "Team4", "Team5"];
    self.team = ko.observableArray(teamList);

    priorityList = [1, 2, 3, 4, 5];
    self.priority = ko.observableArray(priorityList);

    complexityList = [1, 2, 3, 4, 5];
    self.complexity = ko.observableArray(complexityList);

    // filterArray(filter_name)
    // Adds a filter to the ViewModel
    /// knockoutjs.com/documentation/observableArrays.html


    var filterArray = function (filter_name) {
        self.filters.push(filter);
        console.log("Added " + filter);
    };


    //list filters
    var getFilters = function () {
        for (var i = 0; i < this.filters.length; i++) {
            Console.log(this.filters[i]);
        }
    };

    // Criteria Sort: Overrides sort() with custom criteria
    // Used in the search bar.
    self.criteriaSort = function (criteria) {
        switch (criteria) {
            case "stage":

                self.cards.sort(function (left, right) {
                    return left.Stage() === right.Stage() ? 0 : left.Stage() < right.Stage() ? -1 : 1;
                });

                break;
            case "complexity":
                self.cards.sort(function (left, right) {
                    console.log(left.Complexity() === right.Complexity() ? 0 : (left.Complexity() < right.Complexity() ? -1 : 1));
                    return left.Complexity() === right.Complexity() ? 0 : (left.Complexity() < right.Complexity() ? -1 : 1);
                });
                break;
            case "priority":
                self.cards.sort(function (left, right) {

                    return left.Priority() === right.Priority() ? 0 : (left.Priority() < right.Priority() ? -1 : 1);
                });
                break;
            case "oldest":
                self.cards.sort(function (left, right) {

                    return left.DateAdded() === right.DateAdded() ? 0 : (left.DateAdded() < right.DateAdded() ? -1 : 1);
                });
                break;
            case "newest":
                self.cards.sort(function (left, right) {

                    return left.DateAdded() === right.DateAdded() ? 0 : (left.DateAdded() > right.DateAdded() ? -1 : 1);
                });
                break;
            case "random":
                self.cards.sort(function (left, right) {
                    return Math.random() > Math.random();
                });
                break;
        }
    };




    /* 
     * 
     *          END OF BRENDAN'S CODE
     * 
     * */


    /* 
     * 
     *          START OF CODY'S CODE
     * 
     * */

    //Associative Array where keys are values of stage list indices. Values are associative arrays, where the key is the name is a stage that can be reached, value is true
    self.stageGraph = {};
    self.selectedStage = ko.observable();
    self.newStage = ko.observable();
    self.selectedPath = ko.observable();
    self.newPath = ko.observable();
    self.properties = ["Suggestion", "Suggestor", "Comment"];
    self.selectedDepartment = ko.observable(undefined);
    self.selectedTeam = ko.observable(undefined);
    self.addedTags = ko.observable();

    self.initStageGraph = function () {
        for (var i = 0; i < stageList.length; i++) {
            self.stageGraph[stageList[i]] = {};
        }

        self.stageGraph[stageList[1]][stageList[2]] = true;
        self.stageGraph[stageList[2]][stageList[0]] = true;
        self.stageGraph[stageList[2]][stageList[3]] = true;
        self.stageGraph[stageList[2]][stageList[4]] = true;
        self.stageGraph[stageList[3]][stageList[2]] = true;
        self.stageGraph[stageList[3]][stageList[4]] = true;
        self.stageGraph[stageList[4]][stageList[0]] = true;
        self.stageGraph[stageList[4]][stageList[2]] = true;
        self.stageGraph[stageList[4]][stageList[3]] = true;
        self.stageGraph[stageList[4]][stageList[5]] = true;
        self.stageGraph[stageList[5]][stageList[4]] = true;
        self.stageGraph[stageList[5]][stageList[6]] = true;
        self.stageGraph[stageList[6]][stageList[7]] = true;
        self.stageGraph[stageList[7]][stageList[6]] = true;
        self.stageGraph[stageList[7]][stageList[8]] = true;
        self.stageGraph[stageList[8]][stageList[9]] = true;
        self.stageGraph[stageList[9]][stageList[10]] = true;
        self.stageGraph[stageList[10]][stageList[9]] = true;
        self.stageGraph[stageList[10]][stageList[11]] = true;
        self.stageGraph[stageList[11]][stageList[12]] = true;
        self.stageGraph[stageList[12]][stageList[11]] = true;
        self.stageGraph[stageList[12]][stageList[13]] = true;
        self.stageGraph[stageList[13]][stageList[14]] = true;
    };

    //not implemented, just copied from addStage
    self.removeStagePath = function () {
        self.stage().splice(self.stage.indexOf(self.selectedStage()), 1);
        self.stageGraph[self.selectedStage()] = {};
        self.stage.valueHasMutated();
    };

    self.addStagePath = function () {
        if (self.newPath() === undefined || self.newPath() === null
            || self.newPath() === "" || Object.keys(self.stageGraph[self.selectedStage()]).includes(self.newPath())) {
            return;
        }

        self.stageGraph[self.selectedStage()][self.newPath()] = true;
        self.newPath(undefined);
    };

    self.removeStage = function () {
        self.stage().splice(self.stage.indexOf(self.selectedStage()), 1);
        self.stageGraph[self.selectedStage()] = {};
        self.stage.valueHasMutated();
        self.newPath(undefined);
    };

    self.addStage = function () {
        if (self.newStage() === undefined || self.newStage() === null
            || self.newStage === "" || self.stage().includes(self.newStage())) {
            return;
        }

        self.stageGraph[self.newStage()] = {};
        self.stage().push(self.newStage());
        self.stage.valueHasMutated();
        self.newStage(undefined);
    };

    //Receives a card. Parses the view model's addedCards to an array.
    //Adds the newly parsed array to this given card's tag array.
    self.addTags = function (card) {
        var tagArray = card.Tags();
        var newTagsArray = self.parseTagsToArray(self.addedTags());

        //only add those tags not already present
        var index, length = newTagsArray.length;
        for (index = 0; index < length; index++) {
            if (!tagArray.includes(newTagsArray[index])) {
                tagArray.push(newTagsArray[index]);
            }
        }

        card.Tags(tagArray);
    };

    //receives tags in the form of a string
    //returns tags in the form of an array
    self.parseTagsToArray = function (tags) {
        if (tags === null) return [];

        var tagString = tags.replace(/\s/g, '');
        var tagArray = [];

        var current, wordStart = 0, length = tagString.length;

        for (current = 0; current < length; current++) {
            if (tagString.charAt(current) === ',') {
                tagArray.push(tagString.substring(wordStart, current));
                current++;
                wordStart = current;
            } else if (current === length - 1) {
                tagArray.push(tagString.substring(wordStart, current + 1));
            }
        }

        return tagArray;
    };

    //receives tags in the form of a string array
    //returns tags in the form of a string
    self.tagsToString = function (tagArray) {
        if (tagArray === null) {
            return "";
        }

        var tagString = "";
        var index, length = tagArray.length;
        for (index = 0; index < length; index++) {
            tagString += tagArray[index] + ',';
        }

        return tagString;
    };

    //Custom ko binding for assigning a specified value to an observable when the html element is clicked.
    //Usage: "setObservableOnClick: observableName, observableValue: value".
    ko.bindingHandlers.setObservableOnClick = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var observable = valueAccessor();
            var newObservableValue = allBindings.get('observableValue') || null;

            var newValueAccesssor = function () {
                return function () {
                    observable(newObservableValue);
                };
            };

            ko.bindingHandlers.click.init(element, newValueAccesssor, allBindings, viewModel, bindingContext);
        }
    };

    //Filtering options
    self.filters = {
        dateFilter: ko.observable(null),
        textFilter: ko.observable(null),
        teamFilter: ko.observable(null),
        stageFilter: ko.observable(null),
        priorityFilter: ko.observable(null),
        suggestorFilter: ko.observable(null),
        complexityFilter: ko.observable(null),
        departmentFilter: ko.observable(null)
    };

    //Function for determining whether or not a particular card should be visible.
    //Returns true if visible, false if not.
    self.filter = function (card) {
        var matchesFilter;

        matchesFilter = self.filters.teamFilter() === null || card.Team() === self.filters.teamFilter();
        if (!matchesFilter) return false;

        matchesFilter = self.filters.departmentFilter() === null || self.filters.departmentFilter() === undefined || card.Department() === self.filters.departmentFilter();
        if (!matchesFilter) return false;

        matchesFilter = self.filters.textFilter() === null || self.filters.textFilter() === "" || self.containsTags(card);
        if (!matchesFilter) return false;

        //matchesFilter = something with dateFilter
        //if () return false;

        matchesFilter = self.filters.stageFilter() === null || card.Stage() === self.filters.stageFilter();
        if (!matchesFilter) return false;

        matchesFilter = !self.filters.complexityFilter() || card.Complexity() === self.filters.complexityFilter();
        if (!matchesFilter) return false;

        matchesFilter = !self.filters.priorityFilter() || card.Priority() === self.filters.priorityFilter();
        if (!matchesFilter) return false;

        matchesFilter = self.filters.suggestorFilter() === null || self.filters.suggestorFilter() === undefined || card.Suggestor() === self.filters.suggestorFilter();
        if (!matchesFilter) return false;

        return true;
    };

    //search for each tag from the filter, return true if they are all contained in the given card
    self.containsTags = function (card) {
        if (card.Tags() === null) {
            if (self.filters.textFilter() === null || self.filters.textFilter() === "") {
                return true;
            } else {
                return false;
            }
        }

        var filter = self.filters.textFilter();
        filter = self.parseTagsToArray(filter);

        var containsTag = false;

        var cardIndex, cardLength = card.Tags().length;
        var filterIndex, filterLength = filter.length;

        //search the given card for each filter tag
        for (filterIndex = 0; filterIndex < filterLength; filterIndex++) {
            for (cardIndex = 0; cardIndex < cardLength; cardIndex++) {
                if (card.Tags()[cardIndex].includes(filter[filterIndex])) {
                    containsTag = true;
                    break;
                }
            }

            if (!containsTag) {
                return false;
            }
            containsTag = false;
        }
        return true;
    };

    //Receives a card object. Updates the card to match the
    //value stored in the database.
    function getCard(card) {
        ajaxHelper(cardsUri + card.Id(), 'GET').done(function (data) {
            self.cardFromDB(data, card);
        });
    }

    //This function converts a card from the backend to a frontend card. The difference
    //is just that a frontend card uses ko.observables for its properties.
    self.cardFromDB = function (cardDB, cardJS) {
        cardJS.Id = ko.observable(cardDB.Id);
        cardJS.Suggestion = ko.observable(cardDB.Suggestion);
        cardJS.Suggestor = ko.observable(cardDB.Suggestor);
        cardJS.DateAdded = ko.observable(cardDB.DateAdded);
        cardJS.Department = ko.observable(cardDB.Department);
        cardJS.Team = ko.observable(cardDB.Team);
        cardJS.Stage = ko.observable(cardDB.Stage);
        cardJS.Comment = ko.observable(cardDB.Comment); //TODO: convert string to string array
        cardJS.Deleted = ko.observable(cardDB.Deleted);
        cardJS.Complexity = ko.observable(cardDB.Complexity);
        cardJS.Notes = ko.observable(cardDB.Notes);
        cardJS.Priority = ko.observable(cardDB.Priority);
        cardJS.Tags = ko.observable(cardDB.Tags);
        cardJS.Tags = ko.observableArray(self.parseTagsToArray(cardJS.Tags()));

        return cardJS;
    };

    self.cardToDB = function (cardDB, cardJS) {
        cardDB.Suggestion = cardJS.Suggestion();
        cardDB.Suggestor = cardJS.Suggestor();
        cardDB.DateAdded = cardJS.DateAdded();
        cardDB.Department = cardJS.Department();
        cardDB.Team = cardJS.Team();
        cardDB.Stage = cardJS.Stage();
        cardDB.Comment = cardJS.Comment();//TODO: convert string array to string

        if (typeof cardDB.Comment !== 'string') {
            console.log('Comments are not a string: ' + cardDB.Comments);
            console.log('Converting to string.');
            cardDB.Comment = "";
        }

        cardDB.Deleted = cardJS.Deleted();
        cardDB.Complexity = cardJS.Complexity();
        cardDB.Notes = cardJS.Notes();
        cardDB.Priority = cardJS.Priority();
        cardDB.Tags = self.tagsToString(cardJS.Tags());

        return cardDB;
    };
    /* 
     * 
     *          END OF CODY'S CODE
     * 
     * */


    /* 
     * 
     *          START OF CHARLIE'S CODE
     * 
     * */
    self.cards = ko.observableArray();
    self.error = ko.observable();
    self.detail = ko.observable();
    self.selectedCard = ko.observable();
    self.department = ko.observable();
    self.newComment = ko.observable();
    self.displayName = ko.observable();

    //Append comment to existing comments string

    self.displayComment = function () {
        if (self.selectedCard().Comment() === null) {
            self.selectedCard().Comment("");
            return;
        }

        var stringToSplit = self.selectedCard().Comment();
        stringToSplit = stringToSplit.toString();

        //console.log("stringToSplit: \'" + stringToSplit + "\'");
        self.selectedCard().Comment(stringToSplit.split('<BR>,'));
    };

    self.commentsToString = function () {
        self.selectedCard().Comment(self.selectedCard().Comment().toString());
        //var str = self.commentArray().toString();

        //if (str.charAt(0) === ',') {
        //    str = str.substr(1);
        //}

        //self.selectedCard().Comment(str);
    }


    self.appendComment = function () {
        console.log("called appendComment");

        if (self.displayName() === undefined || self.newComment === undefined) {
            return;
        }

        if (self.displayName() === '' || self.newComment === '') {
            self.selectedCard().Comment().toString();
            return;
        }


        if (self.selectedCard().Comment() === null) {
            self.selectedCard().Comment(" ");
        }

        var stringToPush = "<strong>" + self.displayName() + ":</strong> <br>" + '\n';
        stringToPush += self.newComment();
        //console.log("Pushing: " + stringToPush + " on to the array.");
        self.selectedCard().Comment().push(stringToPush);

        for (i = 0; i < self.selectedCard().Comment().length; i++) {
            self.selectedCard().Comment()[i] += "<BR>";
        }
        //alert(self.selectedCard().Comment());
    };


        //Colorize cards by priority
        (function ($) {
            $.fn.clickToggle = function (func1, func2) {
                var funcs = [func1, func2];
                this.data('toggleclicked', 0);
                this.click(function () {
                    var data = $(this).data();
                    var tc = data.toggleclicked;
                    $.proxy(funcs[tc], this)();
                    data.toggleclicked = (tc + 1) % 2;
                });
                return this;
            };
        }(jQuery));

    $('#colorize').clickToggle(function () {
        console.log("colorize!");
        $('*[class^="card-priority5"]').css('animation-iteration-count', '0.5');
        $('*[class^="card-priority"]').removeClass('card-body');
    }, function () {
        $('*[class^="card-priority"]').removeClass('*[class^="card-priority"]').addClass('card-body');
        $('*[class^="card-priority5"]').css('animation-iteration-count', '0');
    });

    $('.party').on("click", function () {
        console.log("Party!");
        $('*[class^="card-priority"]').toggleClass('party');
    });



    //Edit a card
    self.putCard = function (givenCard) {
        var card = {};

        if (givenCard === null || givenCard === undefined) {
            card = self.cardToDB({}, self.selectedCard());
            card.Id = self.selectedCard().Id();
        } else {
            card = self.cardToDB({}, givenCard);
            card.Id = givenCard.Id();
        }
        console.log(card);
        ajaxHelper(cardsUri + card.Id, 'PUT', card).done(function (item) {
        });

        //force the modal to close when the user clicks "submit":
        $('#editCardModal').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    };

    //delete cards
    self.deleteCard = function (formElement) {
        ajaxHelper(`${cardsUri}${formElement.Id()}`, 'DELETE').done(function (item) {
            self.cards.remove(formElement);
        });
    };

    //Add cards
    self.newCard = {
        Suggestion: ko.observable(""),
        DateAdded: ko.observable(new Date().toLocaleString()),
        Suggestor: ko.observable("Unassigned"),
        Department: ko.observable("Unassigned"),
        Team: ko.observable("Unassigned"),
        Stage: ko.observable("New Submissions"),
        Comment: ko.observable(""),
        Deleted: ko.observable("false"),
        Complexity: ko.observable(1),
        Notes: ko.observable(""),
        Priority: ko.observable(1),
        Tags: ko.observableArray([])
    };

    //Add cards
    self.addCard = function () {
        var card = self.cardToDB({}, self.newCard);
        ajaxHelper(cardsUri, 'POST', card).done(function (item) {
            self.cards.push(self.cardFromDB(item, {}));
        });
    };

    //Ajax helper function. Returns error messages
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null
        }).fail(function (jqXHR, textStatus, errorThrown) {
            self.error(errorThrown);
        });
    }

    //Get cards  
    function getAllCards() {
        ajaxHelper(cardsUri, 'GET').done(function (data) {
            self.cards([]);
            var i, length = data.length;
            for (i = 0; i < data.length; i++) {
                if (data[i] === null) { continue; }
                self.cards().push(self.cardFromDB(data[i], {}));
            }
            self.cards.valueHasMutated();
        });
    }



    // Fetch the initial data.
    self.initStageGraph();
    getAllCards();
    //toggle jquery visiblity

    (function ($) {
        $.fn.invisible = function () {
            return this.each(function () {
                $(this).css("visibility", "hidden");
            });
        };
        $.fn.visible = function () {
            return this.each(function () {
                $(this).css("visibility", "visible");
            });
        };
    }(jQuery));

    //Add a Card Hide/Show Logic

    hideInputs = function (value) {
        //alert("Hiding Inputs :: " + value);

        if (value === "Builder") {
            $(".hideFromBuilders").hide();
        } else {
            $(".hideFromBuilders").show();
        }
    };
    /* 
     * 
     *          END OF CHARLIE'S CODE
     * 
     * */


    /* 
     * 
     *          START OF KARL'S CODE
     * 
     * */

    //Draggable Sidebar Functions
    var $cardHolder = $("#sortable-cards");
    var $sidebar = $(".sidebar-suggestion");

    $(function () {
        $(".sidebar-suggestion").droppable({
            accept: "#sortable-cards > li",
            classes: {
                "ui-droppable-active": "ui-state-highlight"
            },
            drop: function (event, ui) {
                removeCard(ui.draggable);
                var card = ko.contextFor(ui.draggable[0]).$data;
                card.Department(ko.contextFor(event.target.parentElement).$data);
                card.Department.valueHasMutated();
                self.putCard(card);
            }
        });
    });

    $('#editCardModal').on('hidden.bs.modal', function () { self.commentsToString(); });

    $(function () {
        $cardHolder.sortable({
            revert: "true",
            placeholder: "ui-state-highlight",
            forcePlaceholderSize: true
        }).disableSelection();
    });

    $(function () {
        $(".sidebar-suggestion").sortable({
            revert: "true",
            placeholder: "ui-state-highlight",
            forcePlaceholderSize: true
        }).disableSelection();
    });

    function removeCard($item, value) {
        $item.fadeOut(function () {
            //Todo Edit Card Team
            //console.log("Card Dropped. Department Changed");
            //console.log($item);
            //console.log(self.cards());
        }).fadeIn();
    }

};//END OF VIEWMODEL
/* 
     * 
     *          END OF KARL'S CODE
     * 
     * */

$('.main').css("background", "url('/Content/images/loading3.gif') center center fixed");
setTimeout(() => {
    $('.main').css("background", "");
    $('.main-page').css("display", "block");
}, 2800); //Best is 2800
//function loadImage() {
//    var timeoutID;

//    console.log("Loaded Image");
//    //$("<img style='width:25%' src='https://78.media.tumblr.com/2ec0f4e615f07842fd684827f83ce5d7/tumblr_p4sazfHW2E1ts4htvo1_540.gif'>").appendTo("body");
//    //$("body").css("background-color", "black").css("background", "url ('Content/images/loading.gif') center center no-repeat fixed");
//    $('body').css("background", "url('Content/images/loading3.gif') center center fixed").css("background-color", "black");
//    timeoutID = window.setTimeout(loadScreen, 2800); //Best is 2800
//}

//function loadScreen() {
//    //$("body").find("img").remove();
//    $(".container").css("display", "block");
//    $("body").css("background", "").css("background-color", "#13a9e1");
//}

//from http://jsfiddle.net/developit/d5w4jpxq/
function tagStuff() {
    let $ = s => [].slice.call(document.querySelectorAll(s));
    $('input[type="tags"]').forEach(tagsInput);
}

tagStuff();

$('.admin-header').click(function () {
    $(this).siblings().toggle();
});

ko.applyBindings(new ViewModel());