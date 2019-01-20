function link(url, name, type) {
    //var self = this;
    this.Name = new ko.observable(name);
    this.URL = new ko.observable(url);
    this.Type = new ko.observable(type);
}

function dothis() {
    console.log("hi");
    var fileName = $("#attachedFiles")[0].files[0].name;
    $("#linkNames").append(fileName);
    console.log(fileName);
}

ko.bindingHandlers.placeholder = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var underlyingObservable = valueAccessor();
        ko.applyBindingsToNode(element, { attr: { placeholder: underlyingObservable } });
    }
};

var ViewModel = function () {
    var self = this;
    self.requests = new ko.observableArray();
    
    self.mailUrlPt1 = 'mailto:';
    self.mailUrlPt2 = '?subject=Data Request ';
    self.mailUrlPt3 = '&body=Hi ';
    self.mailBody = ",%0D%0A%0D%0AYour data request is complete.%0D%0A%0D%0AYou can go out gere to view. In the last column is the requested information, and if you click" +
        " the row the request is in, you can see more information on how we got to those results in Developer Notes and Additional Comments sections.%0D%0A" +
        "[insert link to completed request page here]%0D%0A%0D%0APlease let the Data Science Team know if you have any questions!%0D%0A%0D%0AThanks!";

    self.completeRequest = function completeRequest(data) {
        data.CompletionStatus = ko.observable('Complete');
        var convertedData = self.convertToDB(data);
        ajaxHelper("/api/FormRequests/" + data.Id, 'PUT', convertedData);

        return (self.mailUrlPt1 + 'test@example.com' +
            self.mailUrlPt2 + data.Id +
            self.mailUrlPt3 + data.RequesterName().split(' ')[0] +
            self.mailBody);
    }

    self.currentElement = null;
    self.priorities = ["Low", "Normal", "Important", "Critical"];
    self.queueStatuses = ["New", "In-progress", "Ticket Pending"];
    self.completeStatuses = ["Complete", "Declined"];
    self.formatOptions = ["Excel", "Visualization (chart)", "CFV", "Other"];
    self.formatOptions = ["Excel", "Visualization (chart)", "CFV", "Other"];
    self.statusColors = {
        'New': '#ffff66',
        'In-progress': 'white',
        'Ticket Pending': 'orange',
        'Complete': '#99ff66',
        'Declined': '#ff9980'
    }

    self.filters = {
        'priority': ko.observableArray([]),
        'requester': ko.observableArray([]),
        'status': ko.observableArray([]),
        'dateRequested': { 'from': ko.observable(null), 'to': ko.observable(null) },
        'dateWanted': { 'from': ko.observable(null), 'to': ko.observable(null) }
    };

    self.edit = function edit(data, event) {
        var parent = $('.panel-body').get(0);
        var arr = parent.querySelectorAll('.editable');

        var i, length = arr.length;
        for (i = 0; i < length; i++) {
            $(arr[i]).prop("disabled", false);
        }

       
        $("#Format").css("visibility", "visible");
        
    };

    self.saveEdit = function saveEdit(data) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement;
        var parent = target.parentElement;
        var arr = parent.querySelectorAll('.editable');

        var i, length = arr.length;
        for (i = 0; i < length; i++) {
            $(arr[i]).prop("disabled", true);
        }

        if (self.queueStatuses.indexOf(data.CompletionStatus()) !== -1) {
            data.CompletionStatus('In-progress');
        }

        $("#Format").css("visibility", "hidden");
        var convertedData = self.convertToDB(data);

        //ajaxHelper("/api/FormRequests/" + data.Id, 'PUT', convertedData);

        $.ajax({
            type: "PUT",
            url: "/api/FormRequests/" + data.Id,
            data: JSON.stringify(convertedData),
            contentType: "application/json;charset=utf-8",
            success: function (convertedData, status, xhr) {
                console.log("The result is : " + status + ": " + convertedData);
                $("#successSaveMessage").modal('show');
            },
            error: function (xhr) {


            }
        });
    };

    self.addFile = function addFile(data) {
        var r = {
            "RequestId": data.Id,
            "Type": "File",
            "Name": $("#attachedFiles")[0].files[0].name,
            "URL": $("#attachedFiles").val(),
        };
        ajaxHelper('/api/Links/PostLinks', 'POST', r);
    };

    self.reopenRequest = function reopenRequest(data) {
        data.CompletionStatus('In-progress');
        var convertedData = self.convertToDB(data);
        ajaxHelper("/api/FormRequests/" + data.Id, 'PUT', convertedData);
    }

    self.declineRequest = function declineRequest(data) {
        data.CompletionStatus('Declined');
        var convertedData = self.convertToDB(data);
        ajaxHelper("/api/FormRequests/" + data.Id, 'PUT', convertedData);
    }

    self.linkTicket = function linkTicket(data) {
        var input = $(ticketInput).val();
        var number = parseInt(input);
        var urlStart = 'http://btprojects.buildertrend.net/Issues/IssueDetail.aspx?id='

        if (isNaN(number)) {
            alert("Please enter an integer as the ticket number.");
        } else {
            data.TicketNumber(number);
            data.TicketURL(urlStart + number);
        }

        $(ticketInput).val('');
        return;
    }

    self.matchesFilters = function matchesFilters(request) {

        if (self.filters.priority() && self.filters.priority().length > 0 &&
            self.filters.priority.indexOf(request.PriorityLevel()) === -1) {
            return false;
        }

        if (self.filters.requester() && self.filters.requester().length > 0 &&
            self.filters.requester.indexOf(request.RequesterName()) === -1) {
            return false;
        }

        if (self.filters.status() && self.filters.status().length > 0 &&
            self.filters.status.indexOf(request.CompletionStatus()) === -1) {
            return false;
        }

        if (self.filters.dateWanted.from() &&
            new Date(self.filters.dateWanted.from()) > new Date(request.DateWanted())) {
            return false;
        }

        if (self.filters.dateWanted.to() &&
            new Date(self.filters.dateWanted.to()) < new Date(request.DateWanted())) {
            return false;
        }

        if (self.filters.dateRequested.from() &&
            new Date(self.filters.dateRequested.from()) > new Date(request.DateRequested())) {
            return false;
        }

        if (self.filters.dateRequested.to() &&
            new Date(self.filters.dateRequested.to()) < new Date(request.DateRequested())) {
            return false;
        }

        return true;
    };

    self.convertToDB = function convertToDB(request) {
        var x = request.Format();
        if (useFormat === "#otherFormatVal") {
            x = request.OtherFormat();
        }
        var convertedRequest = {
            "Id": request.Id,
            "DateRequested": request.DateRequested,
            "DateWanted": request.DateWanted(),
            "RequesterName": request.RequesterName(),
            "Format": x,
            "OtherFormat": request.Format(),
            "PriorityLevel": request.PriorityLevel(),
            "NumberRequests": request.NumberRequests(),
            "Requests": request.Requests(),
            "UsageExplanation": request.UsageExplanation(),
            "Description": request.Description(),
            "RequestComments": request.RequestComments(),
            "Viewers": request.Viewers(),
            "NumberViewers": request.NumberViewers(),
            "DatePulled": request.DatePulled(),
            "DataPulledBy": request.DataPulledBy(),
            "DevComments": request.DevComments(),
            "UncompletionReason": request.UncompletionReason(),
            "CompletionStatus": request.CompletionStatus(),
            "TicketNumber": request.TicketNumber(),
            "TicketURL": request.TicketURL(),
            "filterNDBuilders": request.filterNDBuilders(),
            "filterOpenBuilders": request.filterOpenBuilders(),
            "filterUSBuilders": request.filterUSBuilders(),
            "filterOther": request.filterOther(),
            "filterToDate": request.filterToDate(),
            "filterFromDate": request.filterFromDate(),
        }
        //convertedRequest
        //if (request.Format() === "Other") {
        //    convertedRequest.OtherFormat = request.Format;
        //}
        //self.formatOptions.push(request.OtherFormat());
        return convertedRequest;
    }

    self.convertFromDB = function convertFromDB(request) {
        var convertedRequest = {
            "Id": request.Id,
            "DateRequested": new Date(request.DateRequested),
            "DateWanted": new ko.observable(new Date(request.DateWanted)),
            "RequesterName": new ko.observable(request.RequesterName),
            "PriorityLevel": new ko.observable(request.PriorityLevel),
            "NumberRequests": new ko.observable(request.NumberRequests),
            "Requests": new ko.observable(request.Requests),
            "UsageExplanation": new ko.observable(request.UsageExplanation),
            "Format": new ko.observable(request.Format),
            "OtherFormat": new ko.observable(request.Format),
            "Description": new ko.observable(request.Description),
            "RequestComments": new ko.observable(request.RequestComments),
            "Viewers": new ko.observable(request.Viewers),
            "NumberViewers": new ko.observable(request.NumberViewers),
            "DatePulled": new ko.observable(new Date(request.DatePulled)),
            "DataPulledBy": new ko.observable(request.DataPulledBy),
            "DevComments": new ko.observable(request.DevComments),
            "UncompletionReason": new ko.observable(request.UncompletionReason),
            "CompletionStatus": new ko.observable(request.CompletionStatus),
            "TicketNumber": new ko.observable(request.TicketNumber),
            "TicketURL": new ko.observable(request.TicketURL),
            "LinksList": new ko.observableArray([]),
            "filterNDBuilders": new ko.observable(request.filterNDBuilders),
            "filterOpenBuilders": new ko.observable(request.filterOpenBuilders),
            "filterUSBuilders": new ko.observable(request.filterUSBuilders),
            "filterOther": new ko.observable(request.filterOther),
            "filterToDate": new ko.observable(new Date(request.filterToDate)),
            "filterFromDate": new ko.observable(new Date(request.filterFromDate))
        }

        return convertedRequest;
    }

    self.getRequests = function getRequests() {
        ajaxHelper('/api/FormRequests/', 'GET').done(function (data) {
            self.requests();

            var i, length = data.length;
            for (i = 0; i < length; i++) {
                self.requests.push(self.convertFromDB(data[i]));
            }

            self.getLinks();
            self.requests.sort(DateRequestedComparatorA);
        });
        console.log(self.requests());
    };

    self.sort = function sort(element, data, comparatorA, comparatorD) {
        if (element !== self.currentElement) $(element).removeClass('sortedAscending');

        self.currentElement = element;
        var jqueryElement = $(element);

        if (jqueryElement.hasClass('sortedAscending')) {
            data.requests.sort(comparatorD);
        } else {
            data.requests.sort(comparatorA);
        }

        return jqueryElement.toggleClass('sortedAscending');
    };

    self.addRequesterFilter = function addRequesterFilter(data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement;
        var value = $(target).prev().val();

        if (self.filters.requester.indexOf(value) === -1) {
            self.filters.requester.push(value);
            $(target).prev().val('');
        }
    }

    ko.bindingHandlers.date = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            ko.utils.registerEventHandler(element, "change", function () {
                var value = valueAccessor();
                value(new Date(element.value));
                console.log('wooooah');
                console.log(value());
            });
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = valueAccessor();
            element.value = value().toISOString().substring(0, 10);
        }
    };

    self.getRequests();

    self.getLinks = function getLinks() {
        ajaxHelper('/api/Links/', 'GET').done(function (dataLinks) {

            var length = self.requests().length;
            var linkLength = dataLinks.length;

            for (var k = 0; k < linkLength; k++) {
                for (var j = 0; j < length; j++) {
                    if (dataLinks[k].RequestId === self.requests()[j].Id) {
                        self.requests()[j].LinksList.push(new link(dataLinks[k].URL, dataLinks[k].Name, dataLinks[k].Type));
                    }
                }

            }
        });
    };
    var useFormat;
    self.addOther = function addOther() {
        console.log("hi");
        if ($("#Format :selected").text() === "Other") {
            $("#otherFormatVal").css("visibility", "visible");
            useFormat = "#otherFormatVal";
        } else {
            $("#otherFormatVal").css("visibility", "hidden");
            useFormat = "#Format";
        }

    }

};



ko.applyBindings(new ViewModel());


//Ajax helper function. Returns error messages
function ajaxHelper(uri, method, data) {
    return $.ajax({
        type: method,
        url: uri,
        dataType: 'json',
        contentType: 'application/json',
        data: data ? JSON.stringify(data) : null
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
    });
}


var errorReminded = false;
var formatID = "#Format";
$("#Format").click(function () {
    console.log("hi");
    if ($("#Format").val() === "Other") {
        //$("#otherFormat").click(function () {
        $("#otherFormat").css("visibility", "visible");
        formatID = "#otherFormatVal";
    } else {
        $("#otherFormat").css("visibility", "hidden");
        formatID = "#Format";
    }
});
$("#Submit").click(function () {
    //function add() {
    var r = {
        "DateRequested": new Date().toLocaleDateString(),
        "DateWanted": $("#DateWanted").val(),
        "RequesterName": $("#RequesterName").val(),
        "PriorityLevel": $("#PriorityLevel").val(),
        "NumberRequests": $("#NumberRequests").val(),
        "Format": $(formatID).val(),
        "Requests": $("#Requests").val(),
        "UsageExplanation": $("#UsageExplanation").val(),
        "Description": $("#Description").val(),
        "Viewers": $("#Viewers").val(),
        "NumberViewers": $("#NumberViewers").val(),
        "RequestComments": $("#RequestComments").val(),
        "DatePulled": new Date().toLocaleDateString(),
        "CompletionStatus": "New",
        "filterNDBuilders": $("#filterNDBuilders").is(':checked'),
        "filterOpenBuilders": $("#filterOpenBuilders").is(':checked'),
        "filterUSBuilders": $("#filterUSBuilders").is(':checked'),
        "filterOther": $("#filterOther").val(),
        "filterFromDate": new Date().toLocaleDateString(),
        "filterToDate": new Date().toLocaleDateString()
    };

    var json = JSON.stringify(r);
    console.log("REQUEST: " + r);
    console.log("Stringified: " + json);
    $.ajax({
        type: "POST",
        url: '/api/FormRequests/PostFormRequest',
        data: JSON.stringify(r),
        contentType: "application/json;charset=utf-8",
        success: function (data, status, xhr) {
            console.log("The result is : " + status + ": " + data);
            $("#successMessage").modal('show');

            //window.location.href = "/Home/RequestSubmission";
        },
        error: function (xhr) {
            //$("#successMessage").modal('show');
            console.log(xhr.responseText);

            var values = JSON.parse(xhr.responseText);
            var modelState = values.ModelState;

            if (!errorReminded) {
                console.log(values.ModelState);
                for (key in modelState) {
                    $("#" + key).after(`<span class="text-danger" style="display: inline-block">*` + modelState[key] + `</span>`);
                    console.log(key);
                }
            }
            errorReminded = true;
        }
    });


});

$("#successOk").click(function () {
    window.location.href = "/Home/RequestSubmission";
})



document.addEventListener("click", function (event) {
    var openDropdown = $('.dropdown.open');

    if (openDropdown.length === 0) return;

    var element = $(event.target);
    var parent = element.parent();
    var inMenu = parent.hasClass('dropdown') || parent.parent().hasClass('dropdown') ||
        parent.parent().parent().hasClass('dropdown') || parent.parent().parent().parent().hasClass('dropdown');

    if (!inMenu) {
        openDropdown.removeClass('open');
    } else {
        if (element.hasClass('dropdown-toggle')) {
            openDropdown.addClass('open');
        } else {
            return;
        }
    }
    event.stopPropagation();
});

$('.dropdown').on("hide.bs.dropdown", function (event) {
    return false;
});

function DateRequestedComparatorA(request1, request2) {
    var date1 = new Date(request1.DateRequested);
    var date2 = new Date(request2.DateRequested);

    if (date1 > date2) {
        return 1;
    } else if (date2 > date1) {
        return -1;
    } else {
        return 0;
    }
}

function DateRequestedComparatorD(request1, request2) {
    return DateRequestedComparatorA(request1, request2) * -1;
}

function DateWantedComparatorA(request1, request2) {
    var date1 = new Date(request1.DateWanted());
    var date2 = new Date(request2.DateWanted());

    if (date1 > date2) {
        return 1;
    } else if (date2 > date1) {
        return -1;
    } else {
        return 0;
    }
}

function DateWantedComparatorD(request1, request2) {
    return DateWantedComparatorA(request1, request2) * -1;
}

function PriorityComparatorA(request1, request2) {
    var priorities = {
        "Critical": 1,
        "Important": 2,
        "Normal": 3,
        "Low": 4
    };
    var priority1 = priorities[request1.PriorityLevel()];
    var priority2 = priorities[request2.PriorityLevel()];

    priority1 = priority1 === undefined ? 5 : priority1;
    priority1 = priority1 === undefined ? 5 : priority1;

    if (priority1 > priority2) {
        return 1;
    } else if (priority2 > priority1) {
        return -1;
    } else {
        return 0;
    }
}

function PriorityComparatorD(request1, request2) {
    return PriorityComparatorA(request1, request2) * -1;
}

function RequesterComparatorA(request1, request2) {
    var requester1 = request1.RequesterName();
    var requester2 = request2.RequesterName();
    if (requester1 > requester2) {
        return 1;
    } else if (requester2 > requester1) {
        return -1;
    } else {
        return 0;
    }
}

function RequesterComparatorD(request1, request2) {
    return RequesterComparatorA(request1, request2) * -1;
}

function StatusComparatorA(request1, request2) {
    var status1 = request1.CompletionStatus();
    var status2 = request2.CompletionStatus();

    if (status1 > status2) {
        return 1;
    } else if (status2 > status1) {
        return -1;
    } else {
        return 0;
    }
}

function StatusComparatorD(request1, request2) {
    return StatusComparatorA(request1, request2) * -1;
}


