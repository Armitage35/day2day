var main = function() {
    "use strict";
    
    //adding new comments to the comment list
    $(".comment-input button").on("click", function (event){
        //a new paragraph is being created AND THEN we add the content "this is a new comment"
        var $new_comment = $("<p>").text($(".comment-input input").val());
        $(".comments").append($new_comment);
    });
};

$(document).ready(main);