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

    //class creator
    function Task(title, complete, createdOn, dueDate) {
        this.title = title;
        this.complete = false;
        this.createdOn = today;
        this.dueDate = today;
    };

    taskCount = 3;
    var userTask = [];

    function onboarding() {
        userTask.push({ title: 'Start by adding a task', complete: false, createOn: today, dueDate: today });
        userTask.push({ title: 'Then complete a task by clicking in the checkbox', complete: false, createOn: today, dueDate: today });
        userTask.push({ title: 'Reorder task by drag and dropping them', complete: false, createOn: today, dueDate: today });
    };

    onboarding()

    var background = "<p class='task list-group-item'  draggable='true' style='cursor:move'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>";

    //show tasks from object
    for (var i = 0; i <= taskCount - 1; i++) {
        $(".taskList").append(background + userTask[i].title + "</p>");
    };

    //adding tasks function
    var addTaskFromInputBox = function() {
        var $new_task;
        if ($(".task-input input").val() !== "") {
            $new_task = $(".task-input input").val();
            //create a new task object
            var task = new Task($new_task, false, today, today);
            userTask.push({ title: $new_task, complete: false, createOn: today, dueDate: today });
            $(".taskList").append(background + task.title + "</p>");
            //empty input field
            $(".task-input input").val("");
            taskCount = taskCount + 1;
            var myUserTask = JSON.stringify(userTask);
            Cookies.remove('myUserTask');
            Cookies.set('myUserTask', myUserTask);
        }
        else {
            alert("Give your task a title");
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
        };
    });

};

$(document).ready(main);