$(document).ready(function () {

    function AddCardViewModel() {
        var self = this;

        self.suggestor = ko.observable("Default");
        self.suggestion = ko.observable("Default");

        self.addCard = function () {
            ajaxHelper('/api/cards/', 'POST', new Card(self.suggestion, self.suggestor));
        }
    }

    function ajaxHelper(url, method, data) {
        return $.ajax({
            type: method,
            url: url,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null
        })
    }

    function Card(suggestion, suggestor) {
        this.Suggestion = suggestion;
        this.Suggestor = suggestor;
        this.Department = "";
        this.Team = "";
        this.Stage = "New Submissions";
        this.Comment = "";
        this.Deleted = false;
        this.Hashtags = [];
        this.Complexity = 0;
        this.Notes = "";
        this.Priority = 1;
    }

    ko.applyBindings(new AddCardViewModel());
})