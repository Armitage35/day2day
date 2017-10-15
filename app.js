var main = function() {

    //change when task is checked
    $('input').change(function(){
        if ($(this).is(':checked')) {
            console.log("yolo");
            $(this).parent().fadeOut();
            }
    });


    //adding new tasks-list to the comment list using the PLUS ICON
    $(".task-input button").on("click", function (event){
        var $new_comment;
        //making sure the box isn't empty (in order to avoid adding empty <p> as tasks-list)
        if ($(".task-input input").val() !== "") {
            //a new paragraph is being created AND THEN we add the content from the input field
                $new_comment = $(".task-input input").val();
                $(".tasks-list").append("<p><input type='checkbox' name='task-marker'>" + $new_comment + "</p>");
                //empty input field
                $(".task-input input").val("");
                //fading the new comment in
                $new_comment.hide();
                $new_comment.fadeIn()
        }
        
    });
    
    //accepting events using the ENTER KEY
    $(".task-input input").on("keypress", function (event) {
        //making sure the typed key is enter
        if (event.keyCode === 13){
            var $new_comment;
            //making sure the box isn't empty (in order to avoid adding empty <p> as tasks-list)
            if ($(".task-input input").val() !== "") {
                //a new paragraph is being created AND THEN we add the content from the input field
                $new_comment = $(".task-input input").val();
                $(".tasks-list").append("<p><input type='checkbox' name='task-marker'>" + $new_comment + "</p>");
                //empty input field
                $(".task-input input").val("");
                //fading the new comment in
                $new_comment.hide();
                $new_comment.fadeIn()
            }
        }
    });
};

$(document).ready(main);