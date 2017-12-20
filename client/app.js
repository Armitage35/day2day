/* global $ */
/* global Cookies */
var main = function() {

    var selectedTask;
    var userTask = [];
    var selectedView = 0;
    var selectedDate;
    var gif;
    var taskCount;
    var myUserTask;

    //selected view
    $("#viewAll").on("click", function() {
        selectedView = 0;
        $("#viewAll").addClass("active");
        $("#viewToday, #viewLate, #viewUpcoming").removeClass("active");
        displayTask();
    });
    $("#viewToday").on("click", function() {
        selectedView = 1;
        $("#viewToday").addClass("active");
        $("#viewAll, #viewLate, #viewUpcoming").removeClass("active");
        displayTask();
    });
    $("#viewLate").on("click", function() {
        selectedView = 2;
        $("#viewLate").addClass("active");
        $("#viewAll, #viewToday, #viewUpcoming").removeClass("active");
        displayTask();
    });
    $("#viewUpcoming").on("click", function() {
        selectedView = 3;
        $("#viewUpcoming").addClass("active");
        $("#viewAll, #viewLate, #viewToday").removeClass("active");
        displayTask();
    });

    //show & hide add task modal
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
        this.createdOn = new Date;
        this.dueDate;
        this.comment;
    };

    //Create an empty cookie file if no cookie is to be found but if one exists, fill the userTask to match the cookie's content
    if (Cookies.get('myUserTask') == undefined) {
        console.log("cookie vide");
    }
    else {
        userTask = Cookies.getJSON('myUserTask')
    };

    //handle cookies
    function updateCookie() {
        myUserTask = JSON.stringify(userTask);
        Cookies.remove('myUserTask');
        Cookies.set('myUserTask', myUserTask);
    }

    taskCount = userTask.length - 1;
    var date1 = new Date().getTime();
    var beginingOfDay = new Date();
    beginingOfDay.getTime(beginingOfDay.setHours(0, 0, 0));
    beginingOfDay = beginingOfDay.getTime();
    var endOfDay = new Date();
    endOfDay.setHours(23, 59, 59);
    endOfDay = endOfDay.getTime();

    //show tasks from object
    function displayTask() {
        $(".taskList").empty();
        onboarding();
        for (var i = 0; i <= taskCount; i++) {
            var j = new Date(userTask[i].dueDate);
            j = j.getTime();
            if (selectedView == 0) {
                displayTaskDetails(i);
            }
            else if (selectedView == 1) {
                if (j > beginingOfDay && j < endOfDay) {
                    displayTaskDetails(i);
                };
            }
            else if (selectedView == 2) {
                if (j < date1 && j < beginingOfDay) {
                    displayTaskDetails(i);
                };
            }
            else if (selectedView == 3) {
                if (j > date1) {
                    displayTaskDetails(i);
                };
            };
        };
    };

    function displayTaskDetails(i) {
        if (userTask[i].complete == false) {
            var dueDateDisplay = new Date(userTask[i].dueDate);
            var dueDateReadable = dueDateDisplay.toDateString();
            if (dueDateReadable == "Wed Dec 31 1969") {
                dueDateReadable = "";
            };
            $(".taskList").append("<p class='task list-group-item'  draggable='true' style='cursor:move' id='" + userTask[i].id + "'><i class='fa fa-bars' aria-hidden='true'></i> <input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + dueDateReadable + "<button type='button' class='btn btn-link comments' data-toggle='modal' data-target='#commentsModal' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</p>");
        };
    };

    function displayComments() {
        $(".taskComments").empty();
        if (userTask[selectedTask].commentNb != 0) {
            for (var i = 0; i < userTask[selectedTask].commentNb; i++) {
                $(".taskComments").append("<p>" + userTask[selectedTask].comment[i] + "</p><hr / class='taskSeparator'>");
            };
        }
        else {
            $(".taskComments").append("<p>No comment has been added yet</p>");
        };
    };



    //the onboarding
    function onboarding() {
        if (taskCount == -1) {
            var onboardingInvite = '<div draggable="false" class="onboarding"> <p> Is this your first time? </p><div class="row justify-content-center"> <button type="button" class="bttn-unite bttn-sm bttn-primary" id="onboardingBttn">Show me around</button> <p style=" background-color: inherit; color: inherit; padding: 0px 10px 0px 10px; "> or </p> <button type="button" class="bttn-unite bttn-sm bttn-primary" data-toggle="modal" data-target="#myModal" id="myInput">Create a task</button> </div> </div>';
            $(".row").append(onboardingInvite);
            $('#onboardingBttn').on("click", function(event) {
                userTask.push({
                    title: 'Start by adding a task',
                    id: taskCount + 1,
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date,
                    dueDate: null,
                    comment: []
                });
                taskCount++;
                userTask.push({
                    title: 'Then complete a task by clicking in the checkbox',
                    id: taskCount + 1,
                    complete: false,
                    commentNb: 0,
                    createdOn: new Date,
                    dueDate: null,
                    comment: []
                });
                taskCount++;
                userTask.push({
                    title: 'Reorder task by drag and dropping them',
                    id: taskCount + 1,
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date,
                    dueDate: null,
                    comment: []
                });
                taskCount++;
                userTask.push({
                    title: 'You can even add comments and Giphy gifs to your tasks',
                    id: taskCount + 1,
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date,
                    dueDate: null,
                    comment: []
                });
                taskCount++;
                updateCookie();
                displayTask();
                console.log(userTask);
                $(".onboarding").hide();
            });
        };
    };

    //mark task completed
    $(".taskList").on('click', "input", function() {
        $(this).parent().fadeOut();
        var completedTaskID = $(this).parent().attr('id');
        console.log(completedTaskID);
        userTask[completedTaskID].complete = true;
        updateCookie();
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var $new_task;
        if ($("#newTask").val() !== "") {
            $("#newTask").empty();
            $new_task = $("#newTask").val();
            var dueDate = new Date($("#dueDate").val());
            dueDate.setDate(dueDate.getDate() + 1);
            if (dueDate == "Invalid Date") {
                dueDate = null;
            };
            //create a new task object
            var task = new Task($new_task, false, today, today);
            userTask.push({
                title: $new_task,
                id: taskCount + 1,
                complete: false,
                createdOn: new Date,
                dueDate: dueDate,
                commentNb: 0,
                comment: []
            });
            //sending to server
            $.post("todos", {
                'userTask': userTask
            }, function(result) {
                //this callback is called with the server response
                console.log(result);
            });
            $(".task-input input").val("");
            //send the new object to cookie  file
            updateCookie();
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

    //getting the task's ID and displaying comments in the modal
    $(".taskList").on('click', "button", function() {
        selectedTask = $(this).parent().attr('id');
        displayComments();
    });

    //adding comments
    $("#addComment").on("click", function() {
        let newComment = $("#message-text").val();
        if (newComment != "" && newComment != null && newComment != undefined) {
            $("#message-text").val("");
            userTask[selectedTask].comment.push(newComment);
            userTask[selectedTask].commentNb++;
            $(".taskList").empty();
            displayTask();
            updateCookie();
            displayComments();
        };
    });

    //display giphy input box
    $("#gifButton").on("click", function(event) {
        $("#giphyInput").toggle();
        $("#message-text").toggle();
        $("#addComment").hide();
    });

    //toggeling comments to text
    $("#textButton").on("click", function(event) {
        $("#giphyInput").toggle();
        $("#message-text").toggle();
        $("#addComment").show();
    });

    //looking for gif
    $("#testGif").on("click", function(event) {
        var requestedGif = $("#giphyRequest").val().split(' ').join('+');
        var giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV&limit=1";
        var giphyResponse = $.getJSON(giphyCall, function() {
            gif = '<img src="' + giphyResponse.responseJSON.data[0].images.preview_gif.url + '" class="gif">';
            $("#waitingGif").empty().prepend(gif);
        });
    });

    //add the gif to the DOM
    $("#addGif").on("click", function(event) {
        $("#waitingGif").empty();
        var requestedGif = $("#giphyRequest").val();
        userTask[selectedTask].comment.push(gif);
        userTask[selectedTask].commentNb++;
        updateCookie();
        displayTask();
        displayComments();
        $("#giphyRequest").val("");
    });

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

    displayTask();
};

$(document).ready(main);
