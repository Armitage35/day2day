var main = function() {

    var selectedTask;

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
    $("#calendarButton").on("click", function(event) {
        $(".datePicker").toggle();
        $("#dueDate").val(now);
    });

    //class creator
    function Task(title, complete, createdOn, dueDate) {
        this.title = title;
        this.complete = false;
        this.createdOn = today;
        this.dueDate;
        this.comment;
    };

    var userTask = [];

    //Create an empty cookie file if no cookie is to be found but if one exists, fill the userTask to match the cookie's content
    if (Cookies.get('myUserTask') == undefined) {
        Cookies.set('myUserTask', '[{"title":"Start by adding a task","complete":false,"createOn":"08/11/2017","dueDate":"08/11/2017"}');
        console.log("cookie vide")
    }
    else {
        userTask = Cookies.getJSON('myUserTask')
        console.log(userTask);
    };

    taskCount = userTask.length - 1;

    //show tasks from object
    function displayTask() {
        $(".taskList").empty();
        for (var i = 0; i <= taskCount; i++) {
            if (userTask[i].complete == false) {
                $(".taskList").append("<p class='task list-group-item'  draggable='true' style='cursor:move' id='" + userTask[i].id + "'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + userTask[i].dueDate + "<button type='button' class='btn btn-link comments' data-toggle='modal' data-target='#commentsModal' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</p>");
            };
        };
    };

    function displayComments() {
        $(".taskComments").empty();
        if (userTask[selectedTask].commentNb != 0) {
            for (i = 0; i < userTask[selectedTask].commentNb; i++) {
                $(".taskComments").append("<p>" + userTask[selectedTask].comment[i] + "</p><hr / class='taskSeparator'>");
            };
        }
        else {
            $(".taskComments").append("<p>No comment has been added yet</p>");
        };
    };

    //getting the task's ID and displaying comments in the modal
    $(".taskList").on('click', "button", function() {
        selectedTask = $(this).parent().attr('id');
        displayComments();
    });

    // adding comments
    $("#addComment").on("click", function() {
        var newComment = $("#message-text").val();
        if (newComment != "") {
            $("#message-text").val("");
            userTask[selectedTask].comment.push(newComment);
            userTask[selectedTask].commentNb++;
            console.log(userTask);
            $(".taskList").empty();
            displayTask();
            var myUserTask = JSON.stringify(userTask);
            Cookies.remove('myUserTask');
            Cookies.set('myUserTask', myUserTask);
            displayComments();
        };

    });

    //the onboarding
    function onboarding() {
        if (taskCount == -1) {
            var onboardingInvite = '<div draggable="false" class="onboarding" style="text-align: center; background-color: white; color: black;"> <p style=" background-color: inherit; color: inherit; "> Is this your first time? </p> <div class="row justify-content-center" style=" text-align: center; "> <button type="button" class="bttn-unite bttn-sm bttn-primary" id="onboardingBttn">Show me around</button> <p style=" background-color: inherit; color: inherit; padding-left: 0px; ">or</p> <button type="button" class="bttn-unite bttn-sm bttn-primary" data-toggle="modal" data-target="#myModal" id="myInput">Create a task</button> </div> </div>';
            $(".taskList").html(onboardingInvite);
            $('#onboardingBttn').on("click", function(event) {
                userTask.push({ title: 'Start by adding a task', id: taskCount + 1, commentNb: 0, complete: false, createOn: today, dueDate: "", comment: [] });
                taskCount++;
                userTask.push({ title: 'Then complete a task by clicking in the checkbox', id: taskCount + 1, complete: false, commentNb: 0, createOn: today, dueDate: "", comment: [] });
                taskCount++;
                userTask.push({ title: 'Reorder task by drag and dropping them', id: taskCount + 1, commentNb: 0, complete: false, createOn: today, dueDate: "", comment: [] });
                taskCount++;
                userTask.push({ title: 'You can even add comments to your tasks', id: taskCount + 1, commentNb: 0, complete: false, createOn: today, dueDate: "", comment: [] });
                taskCount++;
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
        var completedTaskID = $(this).parent().attr('id');
        console.log(completedTaskID);
        userTask[completedTaskID].complete = true;
        var myUserTask = JSON.stringify(userTask);
        Cookies.remove('myUserTask');
        Cookies.set('myUserTask', myUserTask);
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var $new_task;
        if ($("#newTask").val() !== "") {
            $("#newTask").empty();
            $new_task = $("#newTask").val();
            var dueDate = $("#dueDate").val();
            //create a new task object
            var task = new Task($new_task, false, today, today);
            userTask.push({ title: $new_task, id: taskCount + 1, complete: false, createOn: today, dueDate: dueDate, commentNb: 0, comment: [] });
            $(".task-input input").val("");
            //send the new object to cookie  file
            var myUserTask = JSON.stringify(userTask);
            Cookies.remove('myUserTask');
            Cookies.set('myUserTask', myUserTask);
            console.log(userTask);
            taskCount = taskCount + 1;
            $(".datePicker").hide();
            //run the display function again
            displayTask();
        }
        else {
            $('#myModal').modal('hide');
        }
    };

    //supporting giphies
    $("#gifButton").on("click", function(event) {
        $("#giphyInput").toggle();
        $("#message-text").toggle();
    });

    //toggeling comments to text
    $("#textButton").on("click", function(event) {
        $("#giphyInput").toggle();
        $("#message-text").toggle();
    });

    //looking for gif
    $("#testGif").on("click", function(event) {
        var requestedGif = $("#giphyRequest").val();
        var giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV&limit=1";
        var giphyResponse = $.getJSON(giphyCall, function() {
            console.log(giphyResponse);
            var gif = giphyResponse.responseJSON.data[0].images.preview_gif.url;
            var suggestedGif = '<img src="'+ gif +'">'
            console.log(suggestedGif);
            $("#giphyInput").append(suggestedGif);
        });
    })


    //trigger task adding on button click
    $(".task-input #plusButton").on("click", function(event) {
        addTaskFromInputBox();
    });

    //trigger task adding on enter key
    $(".task-input input").on("keypress", function(event) {
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        };
    });

};

$(document).ready(main);
