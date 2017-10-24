var main = function() {
    
    //make tasks draggable
    Sortable.create(draggable, { /* options */ });

    //hide tasks when completed
    $(".taskList").on('click', "input",function() {
        $(this).parent().fadeOut();
    });

    //adding tasks function
    var addTaskFromInputBox = function () {
        var $new_task;
        if ($(".task-input input").val() !== "") {
           //a new paragraph is being created AND THEN we add the content from the input field
                $new_task = $(".task-input input").val();
                $(".taskList").append("<p class='task list-group-item'><i class='fa fa-bars' aria-hidden='true' draggable='true' style='cursor:move'></i> <input type='checkbox' name='task-marker'>" + $new_task + "</p>");
                //empty input field
                $(".task-input input").val("");
                //fading the new task in
                $new_task.hide();
                $new_task.fadeIn()
        }
    };
    
    //trigger task hiding on button click
    $(".task-input button").on("click", function(event) {
        addTaskFromInputBox();
    });
    
    //trigger task hiding on enter key
    $(".task-input input").on("keypress", function(event){
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        }
    })
   
};

$(document).ready(main);