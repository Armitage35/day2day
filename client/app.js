/* global $ */
/* global Cookies */

var main = function() {

    var selectedTask,
        userTask = [],
        selectedView = 0,
        gif,
        giphyApiKey = "kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV",
        unsplashApiKey = "d9dbf001ba658ce6d8172a427b1a7a3e986aa970d038aade36ff7c54b05ffb0e",
        openWeatherMapApiKey = "d4dafd356c01ea4b792bb04ead253af1",
        userAvatar,
        userID;

    //getting the task's ID and displaying comments in the modal
    $(".taskList").on('click', "button", function() {
        selectedTask = $(this).parent().attr('id');
        displayComments();
    });

    //handling user id cookie and getting user's tasks
    if (Cookies.get('userid') == undefined) { //when id is not in a cookie
        window.location.replace("/auth.html");
    }
    else {
        userID = Cookies.get('userid'); //when user alerady has a cookie
        $.ajax({
            url: "todos",
            type: 'GET',
            data: { userID },
            success: function(data) {
                console.log(userID);
                userTask = data;
                console.log(userTask);
                displayTask();
            }
        });
    }

    //Getting user avatar
    $.ajax({
        url: "/user",
        type: 'GET',
        data: { userID },
        success: function(data) {
            userAvatar = data.avatar;
            $('.userPicture').attr('src', userAvatar);
        }
    });

    //selected view
    $("#today").on("click", function() {
        selectedView = 0;
        $("#selectedTaskView").text("Today");
        displayTask();
    });
    $("#upcoming").on("click", function() {
        selectedView = 1;
        $("#selectedTaskView").text("Upcoming");
        displayTask();
    });
    $("#backlog").on("click", function() {
        selectedView = 2;
        $("#selectedTaskView").text("Backlog");
        displayTask();
    });

    //show & hide add task modal
    $('#myModal').on('shown.bs.modal', function() {
        $('#myInput').focus();
    });

    //using the ctrl + enter keys to display the add task modal
    $(document).on("keypress", function(event) {
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
            $("#fixedBottom").click();
        }
    });

    //declaring today as being today
    var today = new Date(),
        dd = today.getDate(),
        mm = today.getMonth() + 1, //January is 0!
        yyyy = today.getFullYear(),
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
        $("#dueDate").val(new Date().getFullYear() + "-" + new Date().getMonth()+1 + "-" + new Date().getDate());
    });

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
        for (var i = 0; i <= userTask.length; i++) {
            var j = new Date(userTask[i].dueDate);
            j = j.getTime();
            if (selectedView == 2) { //handle displaying the backlog
                displayTaskDetails(i);
            }
            else if (selectedView == 0) {
                if (j > beginingOfDay && j < endOfDay) { //handle displaying today's tasks
                    displayTaskDetails(i);
                }
            }
            else if (selectedView == 1) {
                if (j > endOfDay) { //handle displaying upcoming tasks
                    displayTaskDetails(i);
                }
            }
        }
    }

    function displayTaskDetails(i) {
        if (userTask[i].complete == false) {
            var dueDateDisplay = new Date(userTask[i].dueDate);
            var dueDateReadable = dueDateDisplay.toDateString();
            if (dueDateReadable == "Wed Dec 31 1969") {
                dueDateReadable = "";
            }
            $(".taskList").append("<li class='task list-group-item' data-mongo='" + userTask[i]._id + "' id='" + i + "'><input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + dueDateReadable + "<button type='button' onclick='displayComments()' class='btn btn-link showComments' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</li>");
        }
    }
    
    //closing the comment modal
    $("#closeNewCommentModal").on('click', function() {
        $("#newCommentModal").hide();
        $("#main").show();
    });
    
    function displayComments() {
        $(".commentSection").empty();
        $("#main, #newCommentModal").toggle();
        $("#textComment").addClass("active");
            let createdOnDisplay = new Date(userTask[selectedTask].createdOn).toLocaleDateString();
        if (!!userTask[selectedTask].dueDate) {
            let dueDateDisplay = new Date(userTask[selectedTask].dueDate).toLocaleDateString();
            $(".dueFor").children("p").empty().text(dueDateDisplay);
        }
        $(".commentTaskTitle").text(userTask[selectedTask].title);
        $(".createdOn").children("p").empty().text(createdOnDisplay);
        if (userTask[selectedTask].commentNb != 0) {
            for (var i = 0; i < userTask[selectedTask].commentNb; i++) {
                $(".commentSection").append('<div class="row comment"> <div class="col-1"> <img src=' + userAvatar + ' class="avatarComment"> </div> <div class="col-11"> <div class="bubble"> <p class="commentBody">' + userTask[selectedTask].comment[i] + '</p> </div> <p class="timeStamp">' +'</p> </div> </div>');
            }
        }
        else {
            $(".taskComments").append("<p>No comment has been added yet</p>");
        }
    }
    
    function triggerBacklog() {
        document.getElementById("backlog").click();
    }

    //the onboarding
    function onboarding() {
        if (userTask.length === 0) {
            var onboardingInvite = '<div class="onboarding"> <p class="onboardingMessage"> Is this your first time? </p><div class="row justify-content-center"> <button type="button" class="bttn-unite bttn-sm bttn-primary" onclick=triggerBacklog id="onboardingBttn">Show me around</button> </div> </div>';
            $(".taskList").append(onboardingInvite);
            $('#onboardingBttn').on("click", function(event) {
                userTask.push({
                    title: 'Start by adding a task',
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date(),
                    dueDate: new Date(),
                    comment: []
                });
                userTask.push({
                    title: 'Then complete a task by clicking in the checkbox',
                    complete: false,
                    commentNb: 0,
                    createdOn: new Date(),
                    dueDate: new Date(),
                    comment: []
                });
                userTask.push({
                    title: 'You can even add comments and Giphy gifs to your tasks',
                    commentNb: 0,
                    complete: false,
                    createdOn: new Date(),
                    dueDate: new Date(),
                    comment: []
                });
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
            url: "todos",
            type: 'PUT',
            data: { id: completedTaskMongoID },
            success: function(data) {
                console.log("Task completed");
                console.log(data);
            }
        });

        userTask[completedTaskID].complete = true;
        displayTask();
        //updateCookie();
    });

    //adding tasks function
    var addTaskFromInputBox = function() {
        var new_task;
        if ($("#newTask").val() !== "") {
            new_task = $("#newTask").val();
            $("#newTask").val("");
            var dueDate = new Date($("#dueDate").val());
            dueDate.setDate(dueDate.getDate() + 1);
            if (dueDate == "Invalid Date") {
                dueDate = null;
            }

            var task = {
                title: new_task,
                complete: false,
                createdOn: new Date,
                dueDate: dueDate,
                commentNb: 0,
                comment: [],
                userID: userID
            };

            userTask.push(task);

            //sending to server
            $.post("todos", {
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
            $(".datePicker").hide();
            displayTask();
        }
        else {
            $('#myModal').modal('hide');
        }
    };

    //toggeling between text and gif inputs
    $("#textComment, #giphyComment").on("click", function(event) {
        $("#message-text, #message-giphy, #addComment, #testGif").toggle();
    });

    //adding textual comments
    $("#addComment").on("click", function() {
        let newComment = {commentContent: $("#message-text").val(), commentCreatedOn: new Date(), commentModifiedOn: new Date()};
        if (newComment.commentContent != "" && newComment.commentContent != null && newComment.commentContent != undefined) {
            $("#message-text").val("");
            newComment = newComment.commentContent.replace(/\n\r?/g, '<br />'); //handling spaces
            addComment(newComment);
            displayTask();
            displayComments();
        }
    });

    function addComment(newComment) {
        userTask[selectedTask].comment.push(newComment);
        userTask[selectedTask].commentNb++;

        //telling the server to update the task's comments with the last comment
        $.ajax({
            url: "todos/comment",
            type: 'PUT',
            data: { id: userTask[selectedTask]._id, comment: newComment, commentNb: userTask[selectedTask].commentNb },
            success: function(data) {
                console.log("comment added to the task");
                console.log(data);
            }
        });
        displayComments();
        $("#main, #newCommentModal").toggle();
    }

    //looking for gif and showing it
    $("#testGif").on("click", function(event) {
        $(".testGif").remove();
        $("#addGif").show();
        var requestedGif = $("#message-giphy").val().split(' ').join('+');
        var giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=" + giphyApiKey + "&limit=1";
        var giphyResponse = $.getJSON(giphyCall, function() {
            gif = '<img src="' + giphyResponse.responseJSON.data[0].images.preview_gif.url + '" class="gif';
        $(".commentSection").append('<div class="row comment testGif"> <div class="col-1"> <img src=' + userAvatar + ' class="avatarComment"> </div> <div class="col-11"> <div class="bubble">' + gif + '" > </div><p class="timeStamp ">6th january, 15h28</p></div></div>');
        });
    });

    //add the gif to userTasks
    $("#addGif").on("click", function(event) {
        $("#waitingGif").empty();
        var newComment = gif;
        addComment(newComment);
        displayTask();
        displayComments();
        $("#giphyRequest").val("");
    });

    //trigger task adding on button click
    $("#plusButton").on("click", function(event) {
        addTaskFromInputBox();
    });

    //trigger task adding on enter key
    $("#newTask").on("keypress", function(event) {
        if (event.keyCode === 13) {
            addTaskFromInputBox();
        }
    });

    //handle tools
    $(".fa-tasks").addClass("active");

    //display new background pictures from unsplash
    function updateWallpaper() {
        $.ajax({
            url: "https://api.unsplash.com/photos/random/?client_id=" + unsplashApiKey + "&orientation=landscape&query=nature",
            type: "GET",
            success: function(data) {
                console.log(data);
                let background;
                if (window.screen.width >= 2000) {
                    background = 'url("' + data.urls.full + '")';
                }
                else if (window.screen.width < 2000) {
                    background = 'url("' + data.urls.regular + '")';
                }
                $('body').css('background-image', background);
                $(".thanks").html('<a href="' + data.user.links.html + '?utm_source=day2day&utm_medium=referral" target="_blank" >A picture by ' + data.user.name + ' | Unsplash </a>');
            }
        });
        setInterval(updateWallpaper, 180000); //refresh every 3 minutes
    }

    updateWallpaper();

    //display time
    function updateClock() {
        now = new Date;
        $(".time").html(now.getHours() + ":" + now.getMinutes());
        $(".date").html(now.getDate() + " " + month[now.getMonth()] + " ");
        setInterval(updateClock, 2000);
    }

    updateClock();

    //handle weather
    function handleWeather() {
        let userIP;

        function getIP() { //first, we get the user's IP
            $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
                function(json) {
                    userIP = json.ip;
                    getLocation();
                }
            );
        }

        function getLocation() { // we then get the user's loc based on his IP
            let freegeoip = "https://freegeoip.net/json/" + userIP;
            $.getJSON(freegeoip, function(data) {
                userIP = data;
                getLocalWeather();
            });
        }

        function getLocalWeather() { // we then get the user's loc based on his IP
            let openWeatherMapReq = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=" + userIP.latitude + "&lon=" + userIP.longitude + "&appid=" + openWeatherMapApiKey;
            $.get(openWeatherMapReq, function(data) {
                $(".temperature").text(" | " + Math.ceil(data.main.temp) + " °C");
            });
        }
        getIP();
    }

    handleWeather();
    displayTask();
};

$(document).ready(main);

//auto sign in if cookie's here
if (Cookies.get('userid') !== undefined && window.location.pathname === "./auth.html") {
    window.location = "index.html";
}