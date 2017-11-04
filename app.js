var main = function() {

    //show & hide modal
    $('#myModal').on('shown.bs.modal', function() {
        $('#myInput').focus()
    })

    //make tasks draggable
    Sortable.create(draggable, { /* options */ });

    //hide tasks when completed
    $(".taskList").on('click', "input", function() {
        $(this).parent().fadeOut();
    });

    //using the ctrl + enter keys to display the add task modal
    $(document).on("keypress", function(event) {
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
            $("#myInput").click();
        };
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var $new_task;
        if ($(".task-input input").val() !== "") {
            //a new paragraph is being created AND THEN we add the content from the input field
            $new_task = $(".task-input input").val();

            $(".taskList").append("<p class='task list-group-item'  draggable='true' style='cursor:move'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>" + $new_task + "</p>");
            //empty input field
            $(".task-input input").val("");
            let task = { title: $new_task, date: "does not exists yet" };
            console.log(task.title);
            console.log(task.date);
            //fading the new task in
            $new_task.fadeIn();
        }
    };

    //trigger task hiding on button click
    $(".task-input button").on("click", function(event) {
        addTaskFromInputBox();
        console.log("button click");
    });

    //trigger task hiding on enter key
    $(".task-input input").on("keypress", function(event) {
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        }
    });

    //declaring today as being today
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    today = dd + '/' + mm + '/' + yyyy;

    function createNewTask(name) {
        var obj = {};
        obj.name = name;
        obj.createdOn = today;
        obj.completed = false;
        obj.dueDate = today;
        return obj;
    }

};

$(document).ready(main);