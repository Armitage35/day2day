var main = function() {

    //show & hide modal
    $('#myModal').on('shown.bs.modal', function() {
        $('#myInput').focus()
    });
    



    //make tasks draggable
    Sortable.create(draggable, { /* options */ });

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
    today = dd + '/' + mm + '/' + yyyy;
    var now = yyyy + '-' + mm + '-' + dd;

    //date input
    $("#calendarButton").on("click", function(event){
        $(".modal-body").append("<form style='margin-top:5px'>Your due date:<input type='date' class='field' style='border-right-width:1px; margin-left:10px; width::147px' value='"+ now +"' autofocus name='dueDate'></form>");
    });

    //class creator
    function Task(title, complete, createdOn, dueDate) {
        this.title = title;
        this.complete = false;
        this.createdOn = today;
        this.dueDate = today;
    };

    var userTask = [];

    //Create an empty cookie file if no cookie is to be found but if one exists, fill the userTask to match the cookie's content
    if (Cookies.get('myUserTask') == undefined) {
        Cookies.set('myUserTask', '[{"title":"Start by adding a task","complete":false,"createOn":"08/11/2017","dueDate":"08/11/2017"}');
        console.log("cookie vide")
    }
    else {
        console.log(Cookies.get('myUserTask'));
        userTask = Cookies.getJSON('myUserTask')
    };

    taskCount = userTask.length - 1;
    console.log(taskCount);

        //show tasks from object
    function displayTask() {
        for (var i = 0; i <= taskCount; i++) {
            if (userTask[i].complete == false) {
                $(".taskList").append("<p class='task list-group-item'  draggable='true' style='cursor:move' id='" + userTask[i].id + "'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>" + userTask[i].title + "</p>");
            };
        };
    };


    function onboarding() {
        if (taskCount == -1) {
            var onboardingInvite = '<div draggable="false" class="onboarding" style="text-align: center; background-color: white; color: black;"> <p style=" background-color: inherit; color: inherit; "> Is this your first time? </p> <div class="row justify-content-center" style=" text-align: center; "> <button type="button" class="bttn-unite bttn-sm bttn-primary" id="onboardingBttn">Show me around</button> <p style=" background-color: inherit; color: inherit; padding-left: 0px; ">or</p> <button type="button" class="bttn-unite bttn-sm bttn-primary" data-toggle="modal" data-target="#myModal" id="myInput">Create a task</button> </div> </div>';
            $(".taskList").html(onboardingInvite);
            $('#onboardingBttn').on("click", function(event) {
                userTask.push({ title: 'Start by adding a task', id: taskCount + 1, complete: false, createOn: today, dueDate: today });
                taskCount ++;
                userTask.push({ title: 'Then complete a task by clicking in the checkbox', id: taskCount + 1, complete: false, createOn: today, dueDate: today });
                taskCount ++;
                userTask.push({ title: 'Reorder task by drag and dropping them',id: taskCount + 1,  complete: false, createOn: today, dueDate: today });
                taskCount ++;
                var myUserTask = JSON.stringify(userTask);
                Cookies.remove('myUserTask');
                Cookies.set('myUserTask', myUserTask);
                displayTask();
                console.log("populating now");
                console.log(userTask);
                $('.onboarding').hide();
            });
        };
    };

    onboarding();


    displayTask();

    //mark task completed
    $(".taskList").on('click', "input", function() {
        $(this).parent().fadeOut();
        var completedTaskID = $(this).parent().attr('id');;
        console.log(completedTaskID);
        userTask[completedTaskID].complete = true;
        var myUserTask = JSON.stringify(userTask);
        Cookies.remove('myUserTask');
        Cookies.set('myUserTask', myUserTask);
        console.log(myUserTask);
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var $new_task;
        if ($(".task-input input").val() !== "") {
            $(".taskList").empty();
            $new_task = $(".task-input input").val();
            //create a new task object
            var task = new Task($new_task, false, today, today);
            userTask.push({ title: $new_task, id: taskCount + 1, complete: false, createOn: today, dueDate: today });
            //empty input field
            $(".task-input input").val("");
            //send the new object to cookie  file
            var myUserTask = JSON.stringify(userTask);
            Cookies.remove('myUserTask');
            Cookies.set('myUserTask', myUserTask);
            console.log(myUserTask);
            taskCount = taskCount + 1;
            //run the display function again
            displayTask();
        }
        else {
            $('#myModal').modal('hide');
        }
    };

    //trigger task adding on button click
    $(".task-input #plusButton").on("click", function(event) {
        addTaskFromInputBox();
        console.log("button click");
    });

    //trigger task adding on enter key
    $(".task-input input").on("keypress", function(event) {
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        };
    });

};

$(document).ready(main);
