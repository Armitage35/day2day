var main = function() {
    
    //make tasks draggable
    Sortable.create(draggable, { /* options */ });

    //change when task is checked
    $('input').change(function(){
        if ($(this).is(':checked')) {
            console.log("yolo");
            $(this).parent().fadeOut();
            }
    });

    //adding new taskList to the task list using the PLUS ICON
    $(".task-input button").on("click", function (event){
        var $new_task;
        //making sure the box isn't empty (in order to avoid adding empty <p> as taskList)
        if ($(".task-input input").val() !== "") {
            //a new paragraph is being created AND THEN we add the content from the input field
                $new_task = $(".task-input input").val();
                $(".taskList").append("<p class='task list-group-item'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>" + $new_task + "</p>");
                //empty input field
                $(".task-input input").val("");
                //fading the new task in
                $new_task.hide();
                $new_task.fadeIn()
        }
        
    });
    
    //accepting events using the ENTER KEY
    $(".task-input input").on("keypress", function (event) {
        //making sure the typed key is enter
        if (event.keyCode === 13){
            var $new_task;
            //making sure the box isn't empty (in order to avoid adding empty <p> as taskList)
            if ($(".task-input input").val() !== "") {
                //a new paragraph is being created AND THEN we add the content from the input field
                $new_task = $(".task-input input").val();
                $(".taskList").append("<p class='task list-group-item'><i class='fa fa-bars' aria-hidden='true'></i><input type='checkbox' name='task-marker'>" + $new_task + "</p>");
                //empty input field
                $(".task-input input").val("");
                //fading the new task in
                $new_task.hide();
                $new_task.fadeIn()
            }
        }
    });
};

$(document).ready(main);