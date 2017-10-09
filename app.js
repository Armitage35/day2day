var main = function() {
    "use strict";
    
    //adding new comments to the comment list
    $(".comment-input button").on("click", function (event){
        var $new_comment;
        
        //making sure the box isn't empty (in order to avoid adding empty <p> as comments)
        if ($(".comment-input input").val() !== "") {
            //a new paragraph is being created AND THEN we add the content "this is a new comment"
            $new_comment = $("<p>").text($(".comment-input input").val());
            $(".comments").append($new_comment);
            $(".comment-input input").val("")
        }
        
    });
    
    $(".comment-input input").on("keypress", function (event) {
        
        if (event.keyCode === 13){
            var $new_comment;
            //making sure the box isn't empty (in order to avoid adding empty <p> as comments)
            if ($(".comment-input input").val() !== "") {
                //a new paragraph is being created AND THEN we add the content "this is a new comment"
                $new_comment = $("<p>").text($(".comment-input input").val());
                $(".comments").append($new_comment);
                $(".comment-input input").val("")
            }
        }
    })
};

$(document).ready(main);