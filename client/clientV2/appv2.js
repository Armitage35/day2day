/* global $ */
/* global Cookies */
/* global Sortable */
/* global draggable */

var main = function() {

    var selectedTask,
        userTask = [],
        selectedView = 0,
        gif,
        taskCount,
        myUserTask,
        giphyApiKey = "kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV",
        unsplashApiKey = "d9dbf001ba658ce6d8172a427b1a7a3e986aa970d038aade36ff7c54b05ffb0e",
        userID;

    //auto sign in if cookie's here
    if (Cookies.get('userid') !== undefined && window.location.pathname === "./auth.html") {
        window.location = "clientV2/day2day.html";
    }

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
        $('#myInput').focus();
    });

    //make tasks draggable
    //Sortable.create(draggable, { /* options */ });

    //using the ctrl + enter keys to display the add task modal
    $(document).on("keypress", function(event) {
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
            $("#myInput").click();
        }
    });

    //declaring today as being today
    var today = new Date(),
        dd = today.getDate(),
        mm = today.getMonth() + 1, //January is 0!
        yyyy = today.getFullYear(),
        hh = today.getHours(),
        minutes = today.getMinutes(),
        seconds = today.getSeconds(),
        month = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];


    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '/' + mm + '/' + yyyy;
    var now = yyyy + '-' + mm + '-' + dd;

    //date input show / hide
    $("#calendarButton").on("click", function(event) {
        $(".datePicker").toggle();
        $("#dueDate").val(now);
    });

    //Create an empty cookie file if no cookie is to be found but if one exists, fill the userTask to match the cookie's content
    /* if (Cookies.get('myUserTask') == undefined) {
        console.log("user tasks cookie is empty");
    }
    else {
        userTask = Cookies.getJSON('myUserTask');
    } */

    //handle user task cookie
    function updateCookie() {
        myUserTask = JSON.stringify(userTask);
        Cookies.remove('myUserTask');
        Cookies.set('myUserTask', myUserTask);
    }

    taskCount = userTask.length - 1; //could be set at top
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
        console.log(taskCount)
        for (var i = 0; i <= userTask.length; i++) {
            var j = new Date(userTask[i].dueDate);
            j = j.getTime();
            if (selectedView == 0) {
                displayTaskDetails(i);
            }
            else if (selectedView == 1) {
                if (j > beginingOfDay && j < endOfDay) {
                    displayTaskDetails(i);
                }
            }
        }
        console.log(userTask);
    }

    function displayTaskDetails(i) {
        if (userTask[i].complete == false) {
            var dueDateDisplay = new Date(userTask[i].dueDate);
            var dueDateReadable = dueDateDisplay.toDateString();
            if (dueDateReadable == "Wed Dec 31 1969") {
                dueDateReadable = "";
            }
            $(".taskList").append("<li class='task list-group-item' data-mongo='" + userTask[i]._id + "'style='cursor:move' id='" + userTask[i].id + "'><input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + dueDateReadable + "<button type='button' class='btn btn-link comments' data-toggle='modal' data-target='#commentsModal' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</li>");
        }
    }

    function displayComments() {
        $(".taskComments").empty();
        if (userTask[selectedTask].commentNb != 0) {
            for (var i = 0; i < userTask[selectedTask].commentNb; i++) {
                $(".taskComments").append("<p>" + userTask[selectedTask].comment[i] + "</p><hr / class='taskSeparator'>");
            }
        }
        else {
            $(".taskComments").append("<p>No comment has been added yet</p>");
        }
    }

    //the onboarding
    function onboarding() {
        if (userTask.length === 0) {
            var onboardingInvite = '<div draggable="false" class="onboarding"> <p class="onboardingMessage"> Is this your first time? </p><div class="row justify-content-center"> <button type="button" class="bttn-unite bttn-sm bttn-primary" id="onboardingBttn">Show me around</button> <p style=" background-color: inherit; color: inherit; padding: 0px 10px 0px 10px; "> or </p> <button type="button" class="bttn-unite bttn-sm bttn-primary" data-toggle="modal" data-target="#myModal" id="myInput">Create a task</button> </div> </div>';
            $(".taskList").append(onboardingInvite);
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
                    title: 'You can even add comments and Giphy gifs to your tasks',
                    id: taskCount + 1,
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date,
                    dueDate: null,
                    comment: []
                });
                taskCount++;
                //updateCookie();
                displayTask();
                console.log(userTask);
                $(".onboarding").hide();
            });
        }
    }

    //mark task completed
    $(".taskList").on('click', "input", function() {
        $(this).parent().fadeOut();
        var completedTaskID = $(this).parent().attr('id');
        var completedTaskMongoID = userTask[completedTaskID]._id;
        console.log(completedTaskMongoID);

        //telling the server to update the task
        $.ajax({
            url: "../../todos",
            type: 'PUT',
            data: { id: completedTaskMongoID },
            success: function(data) {
                console.log("Task completed");
                console.log(data);
            }
        });

        userTask[completedTaskID].complete = true;
        //updateCookie();
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var new_task;
        if ($("#newTask").val() !== "") {
            new_task = $("#newTask").val();
            $("#newTask").empty();
            var dueDate = new Date($("#dueDate").val());
            dueDate.setDate(dueDate.getDate() + 1);
            if (dueDate == "Invalid Date") {
                dueDate = null;
            }

            var task = {
                title: new_task,
                id: taskCount + 1,
                complete: false,
                createdOn: new Date,
                dueDate: dueDate,
                commentNb: 0,
                comment: [],
                userID: userID
            };

            userTask.push(task);

            //sending to server
            $.post("../../todos", {
                'userTasks': task
            }, function(result) {
                //this callback is called with the server response
                console.log(result);
                userTask.pop(); //removing the temp object created by client to replace it with the object from mongo
                userTask.push(result);
                console.log(userTask);
            });

            $(".task-input input").val("");
            //send the new object to cookie  file
            //updateCookie();
            //updateCookie();
            taskCount = taskCount + 1;
            $(".datePicker").hide();
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

    //toggeling between text and gif inputs
    $("#textButton, #gifButton").on("click", function(event) {
        $("#giphyInput").toggle();
        $("#message-text").toggle();
        $("#addComment").toggle();
    });

    function addComment(newComment) {
        userTask[selectedTask].comment.push(newComment);
        userTask[selectedTask].commentNb++;

        //telling the server to update the task's comments with the last comment
        $.ajax({
            url: "../../todos/comment",
            type: 'PUT',
            data: { id: userTask[selectedTask]._id, comment: newComment, commentNb: userTask[selectedTask].commentNb },
            success: function(data) {
                console.log("comment added to the task");
                console.log(data);
            }
        });
        displayComments();
    }

    //adding textual comments
    $("#addComment").on("click", function() {
        let newComment = $("#message-text").val();
        if (newComment != "" && newComment != null && newComment != undefined) {
            $("#message-text").val("");
            newComment = newComment.replace(/\n\r?/g, '<br />'); //handling spaces
            addComment(newComment)
            displayTask();
            //updateCookie();
            displayComments();
        }
    });

    //looking for gif and showing it
    $("#testGif").on("click", function(event) {
        var requestedGif = $("#giphyRequest").val().split(' ').join('+');
        var giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=" + giphyApiKey + "&limit=1";
        var giphyResponse = $.getJSON(giphyCall, function() {
            gif = '<img src="' + giphyResponse.responseJSON.data[0].images.preview_gif.url + '" class="gif">';
            $("#waitingGif").empty().prepend(gif);
        });
    });

    //add the gif to userTasks
    $("#addGif").on("click", function(event) {
        $("#waitingGif").empty();
        var newComment = gif;
        addComment(newComment);
        //updateCookie();
        displayTask();
        displayComments();
        $("#giphyRequest").val("");
    });

    //trigger task adding on button click
    $("#plusButton").on("click", function(event) {
        addTaskFromInputBox();
    });

    //trigger task adding on enter key
    $(".task-input input").on("keypress", function(event) {
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        }
    });

    //handling user id cookie and getting user's tasks
    if (Cookies.get('userid') == undefined) { //when id is not in a cookie
        window.location.replace("/auth.html");
    }
    else {
        userID = Cookies.get('userid'); //when user alerady has a cookie
        console.log(userID);
        $.ajax({
            url: "../../todos",
            type: 'GET',
            data: { userID },
            success: function(data) {
                console.log(userID);
                userTask = data;
                displayTask();
                console.log(userTask);
            }
        });
    }

    //display new background pictures from unsplash
    function updateWallpaper() {
        $.ajax({
            url: "https://api.unsplash.com/photos/random/?client_id=" + unsplashApiKey + "&orientation=landscape&query=landscape",
            type: "GET",
            success: function(data) {
                console.log(data);
                let background = '<img src=' + data.urls.regular + '>';
                $(document.body).css('background-image', background);
                $(".thanks").html('<a href="' + data.links.html + '"target="_blank" >A picture by' + data.user.name + '</a>');
            }
        });
        setInterval(updateClock, 180000); //refresh every 3 minutes
    }

    updateWallpaper();

    //display time
    function updateClock() {
        now = new Date;
        $(".time").html(now.getHours() + ":" + now.getMinutes());
        $(".date").html(now.getDate() + " " + month[now.getMonth()]);
        setInterval(updateClock, 2000);
    }

    updateClock();

    //handle tools
    $(".fa-tasks").addClass("active");

    displayTask();

};

$(document).ready(main);
