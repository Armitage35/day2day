/* global $
global Cookies 
global iziToast */

var selectedTask,
    userTask = [],
    userNote = [],
    selectedView = 0,
    gif,
    giphyApiKey = "kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV",
    unsplashApiKey = "d9dbf001ba658ce6d8172a427b1a7a3e986aa970d038aade36ff7c54b05ffb0e",
    openWeatherMapApiKey = "d4dafd356c01ea4b792bb04ead253af1",
    userAvatar,
    userID,
    selectedTool = "task", //sets the default tool
    selectedNote;

var main = function() {

    //getting the task's ID and displaying comments in the modal
    $(".taskList").on('click', "button", function() {
        selectedTask = $(this).parent().attr('id');
        displayComments();
    });

    //add the gif to userTasks
    $("#addGif").on("click", function() {
        $("#waitingGif").empty();
        var newComment = gif;
        addComment(newComment);
        displayTask();
        displayComments();
        $("#giphyRequest").val("");
    });

    //looking for gif and showing it
    $("#testGif").on("click", function() {
        $(".testGif").remove();
        $("#addGif").show();
        var requestedGif = $("#message-giphy").val().split(' ').join('+');
        var giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=" + giphyApiKey + "&limit=1";
        var giphyResponse = $.getJSON(giphyCall, function() {
            gif = '<img src="' + giphyResponse.responseJSON.data[0].images.preview_gif.url + '" class="gif';
            $(".commentSection").append('<div class="row comment testGif"> <div class="col-1"> <img src=' + userAvatar + ' class="avatarComment"> </div> <div class="col-11"> <div class="bubble">' + gif + '" > </div><p class="timeStamp ">6th january, 15h28</p></div></div>');
        });
    });

    //display text input on task details
    $("#textComment").on("click", function(event) {
        handleCommentType("text");
    });

    //display giphy input on task details
    $("#giphyComment").on("click", function(event) {
        handleCommentType("gif");
    });

    //display text input on task details
    $("#pictureComment").on("click", function(event) {
        handleCommentType("picture");
    });

    //adding textual comments
    $("#addComment").on("click", function() {
        let newComment = { commentContent: $("#message-text").val(), commentCreatedOn: new Date(), commentModifiedOn: new Date() };
        if (newComment.commentContent != "" && newComment.commentContent != null && newComment.commentContent != undefined) {
            $("#message-text").val("");
            newComment = newComment.commentContent.replace(/\n\r?/g, '<br />'); //handling spaces
            addComment(newComment);
            displayTask();
            displayComments(selectedTask);
        }
    });

    //closing the comment modal
    $("#closeNewCommentModal").on('click', function() {
        $("#newCommentModal, #main").toggle();
    });

    // closing the note modal
    $("#closeNoteModal").on('click', function() {
        closeNoteModal();
    });

    //trigger task adding on button click
    $("#plusButton").on("click", function() {
        addTask();
    });

    //trigger task adding on enter key
    $("#newTask").on("keypress", function() {
        if (event.keyCode === 13) {
            addTask();
        }
    });

    //date input show / hide
    $("#calendarButton").on("click", function() {
        $(".datePicker").toggle();
        $("#dueDate").val(new Date().getFullYear() + "-" + new Date().getMonth() + 1 + "-" + new Date().getDate());
    });

    //show & hide add task modal
    $('#myModal').on('shown.bs.modal', function() {
        $('#myInput').focus();
    });

    //using the ctrl + enter keys to display the add task modal
    $(document).on("keypress", function() {
        if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
            $(".fixedBottom").click();
        }
    });

    //handle tasks selected view
    $("#today").on("click", function() {
        selectedView = 0;
        selectedTaskViewHandler(selectedView);
    });
    $("#upcoming").on("click", function() {
        selectedView = 1;
        selectedTaskViewHandler(selectedView);
    });
    $("#backlog").on("click", function() {
        selectedView = 2;
        selectedTaskViewHandler(selectedView);
    });

    //mark task complete from the details screen
    $(".detailsCheckbox").on('click', function() {
        $("#newCommentModal, #main").toggle();
        var completedTaskID = selectedTask;
        completeTask(completedTaskID);
    });

    //mark task completed from the main screen
    $(".taskList").on('click', "input", function() {
        $(this).parent().fadeOut();
        var completedTaskID = $(this).parent().attr('id');
        completeTask(completedTaskID);
    });

    //enabling user to only see the background picture
    $('#backgroundTool').on('click', function() {
        handleTool("background")
    });

    $('#taskTool').on('click', function() {
        handleTool("task");
    });

    $('#noteTool').on('click', function() {
        handleTool("note");
    });
    console.log("selected tool: " + Cookies.get('selectedTool'));
    if (Cookies.get('selectedTool') === undefined) {
        handleTool("task");
    }
    else {
        handleTool(Cookies.get('selectedTool'));
    }

    $(".notePreview").on('click', function() {
        displayNoteContent(selectedNote);
    })

    $(".noteTitleInput").val("Note title");

    $('.createdOn').children('p').html(new Date().toDateString());

    $("#saveNote").on('click', function() {
        saveNote(selectedNote);
    });

    $('#newNoteButton').on('click', function() {
        displayNoteContent(-1);
        $('.noteInputZone .noteTitleInput').val('');
    });
    
    $('#archiveNote').on('click', function() {
        archiveNote(selectedNote);
    });
};

$(document).ready(main);

function closeNoteModal() {
    $("#newNoteModal, #main").toggle();
    $('.noteInputZone, .noteTitleInput').val('');
    displayNoteList();
}

function handleTool(selectedTool) {
    $(".accessTools").children().children().children().removeClass('active');
    Cookies.set('selectedTool', selectedTool);
    if (selectedTool === "background") {
        $('.fa-camera-retro').addClass('active');
        $(".tool").hide('slow');
    }
    else if (selectedTool === "task") {
        $('.fa-tasks').addClass('active');
        $(".tool, .taskToolView").show('slow');
        $(".noteToolView").hide();
    }
    else if (selectedTool === "note") {
        $('.fa-sticky-note').addClass('active');
        $(".tool, .noteToolView").show('slow');
        $(".taskToolView").hide();
    }
}

//declaring today as being today
var dd = new Date().getDate(),
    mm = new Date().getMonth() + 1, //January is 0!
    yyyy = new Date().getFullYear(),
    month = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}
var now = yyyy + '-' + mm + '-' + dd;

var beginingOfDay = new Date();
beginingOfDay.getTime(beginingOfDay.setHours(0, 0, 0));
beginingOfDay = beginingOfDay.getTime();
var endOfDay = new Date();
endOfDay.setHours(23, 59, 59);
endOfDay = endOfDay.getTime();

//handling user id cookie and getting user's tasks
if (Cookies.get('userid') == undefined) { //when id is not in a cookie
    window.location.replace("/auth.html");
}
else {
    userID = Cookies.get('userid'); //when user alerady has a cookie

    //get user tasks
    $.ajax({
        url: 'todos',
        type: 'GET',
        data: { userID },
        success: function(data) {
            userTask = data;
            console.log(userTask);
            displayTask();
        }
    });

    //get user notes
    $.ajax({
        url: 'notes',
        type: 'GET',
        data: { userID },
        success: function(data) {
            userNote = data;
            console.log(userNote);
            displayNoteList();
        }
    });
}

//display time
function updateClock() {
    now = new Date();
    var hh = now.getHours();
    if (hh < 10) {
        hh = '0' + hh;
    }
    var minutes = now.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    $(".time").html(hh + ":" + minutes);
    $(".date").html(now.getDate() + " " + month[now.getMonth()] + " ");
    setInterval(updateClock, 2000);
}

updateClock();

//getting user avatar
$.ajax({
    url: "/user",
    type: 'GET',
    data: { userID },
    success: function(data) {
        userAvatar = data.avatar;
        $('.userPicture').attr('src', userAvatar);
    }
});

function selectedTaskViewHandler(selectedView) {
    if (selectedView === 0) {
        $("#selectedTaskView").text("Today");
    }
    else if (selectedView === 1) {
        $("#selectedTaskView").text("Upcoming");
    }
    else if (selectedView === 2) {
        $("#selectedTaskView").text("Backlog");
    }
    displayTask();
}

//show tasks from object
function displayTask() {
    $(".taskList").empty();
    onboarding();
    for (var i = 0; i <= userTask.length; i++) {
        var j = new Date(userTask[i].dueDate);
        j = j.getTime();
        if (selectedView == 0) {
            if (j > beginingOfDay && j < endOfDay) { //handle displaying today's tasks
                displayTaskDetails(i);
            }
        }
        else if (selectedView == 1) {
            if (j > endOfDay) { //handle displaying upcoming tasks
                displayTaskDetails(i);
            }
        }
        else if (selectedView == 2) { //handle displaying the backlog
            displayTaskDetails(i);
        }
    }
}

function displayTaskDetails(i) {
    if (userTask[i].complete == false) {
        var dueDateReadable = new Date(userTask[i].dueDate);
        dueDateReadable = dueDateReadable.toDateString();
        if (dueDateReadable == "Wed Dec 31 1969") {
            dueDateReadable = "";
        }
        $(".taskList").append("<li class='task list-group-item' data-mongo='" + userTask[i]._id + "' id='" + i + "'><input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + dueDateReadable + "<button type='button' onclick='displayComments()' class='btn btn-link showComments' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</li>");
    }
}

function displayComments() {
    $('.detailsCheckbox').prop('checked', false);
    $(".commentSection").empty();
    $("#newCommentModal").show();
    $("#main").hide();
    $(".detailsCheckbox").attr('id', userTask[selectedTask]._id);
    $("#textComment").addClass("active");
    let createdOnDisplay = new Date(userTask[selectedTask].createdOn).toLocaleDateString();
    if (!!userTask[selectedTask].dueDate) {
        let dueDateDisplay = new Date(userTask[selectedTask].dueDate).toLocaleDateString();
        $(".dueFor").children("p").empty().text(dueDateDisplay);
    }
    $(".commentTaskTitle").text(userTask[selectedTask].title);
    $(".createdOn").children("p").empty().text(createdOnDisplay);
    if (userTask[selectedTask].commentNb === 0) {
        $(".commentSection").append("<p class='commentColdState'>You have no comments yet<p>");
    }
    else if (userTask[selectedTask].commentNb != 0) {
        for (var i = 0; i < userTask[selectedTask].commentNb; i++) {
            $(".commentSection").append('<div class="row comment"> <div class="col-1"> <img src=' + userAvatar + ' class="avatarComment"> </div> <div class="col-11"> <div class="bubble"> <p class="commentBody">' + userTask[selectedTask].comment[i] + '</p> </div> <p class="timeStamp">' + '</p> </div> </div>');
        }
    }
    else {
        $(".taskComments").append("<p>No comment has been added to this task yet</p>");
    }
}

//the onboarding
function onboarding() {
    if (userTask.length === 0) {
        var onboardingInvite = '<div class="onboarding"> <p class="text-center"> Is this your first time? </p><div class="row justify-content-center"> <button type="button" class="bttn-unite bttn-sm bttn-primary" id="onboardingBttn">Show me around</button> </div> </div>';
        $(".taskList").append(onboardingInvite);
        $('#onboardingBttn').on("click", function() {
            userTask.push({
                title: 'Start by adding a task',
                complete: false,
                createdOn: new Date(),
                dueDate: new Date(),
                commentNb: 0,
            });
            userTask.push({
                title: 'Then complete a task by clicking in the checkbox',
                complete: false,
                createdOn: new Date(),
                dueDate: new Date(),
                commentNb: 0,
            });
            userTask.push({
                title: 'You can even add comments and Giphy gifs to your tasks',
                complete: false,
                createdOn: new Date(),
                dueDate: new Date(),
                commentNb: 0,
            });
            //updateCookie();
            displayTask();
            console.log(userTask);
            $(".onboarding").hide();
        });
    }
}

function completeTask(completedTaskID) {
    let completedTaskMongoID = userTask[completedTaskID]._id;
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
}

//adding tasks function
function addTask() {
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
            iziToast.success({
                title: 'Fantastic',
                message: 'Your task has been added',
                position: 'topRight',
            });
        });

        $(".task-input input").val("");
        //send the new object to cookie  file
        //updateCookie();
        //updateCookie();
        $(".datePicker").hide();
        displayTask();
    }
}

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
    $('#newCommentModal').show();
    $('#main').hide();
}



//display new background pictures from unsplash
function updateWallpaper() {
    $.ajax({
        url: "https://api.unsplash.com/photos/random/?client_id=" + unsplashApiKey + "&orientation=landscape&query=nature",
        type: 'GET',
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

function handleCommentType(commentType) {
    $(".newCommentInputZone").children().hide();
    $(".commentButtons").children().children().removeClass("active");
    if (commentType === "text") {
        $("#message-text, #addComment").show();
    }
    else if (commentType === "gif") {
        $("#message-giphy, #testGif").show();
    }
    else if (commentType === "picture") {
        $("#message-file, #addFile").show();
        $("#selectedTask").hide().val(userTask[selectedTask]._id);
        $("#commentNb").hide().val(userTask[selectedTask].commentNb);
    }
    $(this).children().addClass("active");
}

handleWeather();
displayTask();
displayNoteList();

function saveNote(selectedNote, status) {

    console.log('note status: ' + status);

    let noteBody = $(".noteInputZone").val(),
        noteTitle = $(".noteTitleInput").val(),
        notePreview = noteBody.substring(0, 115) + "...",
        noteLastEditedOn = new Date(),
        noteID = selectedNote,
        noteMongoID = 0;

    if (status === 'archived') {
        console.log('this note is ' + status);
    } else {
        status = 'unarchived';
    }
    
    // check that note has an ID and is not new
    if (selectedNote != -1) { 
        noteMongoID = userNote[selectedNote]._id;
        console.log('note mongoID: ' + noteMongoID);
    }

    $.ajax({
        url: 'notes',
        type: 'PUT',
        data: { noteBody: noteBody, noteTitle: noteTitle, notePreview: notePreview, noteLastEditedOn: noteLastEditedOn, userid: userID, noteCreatedOn: new Date(), noteMongoID: noteMongoID, noteArchived: status },
        success: function(data) {
            console.log(data);
            if (selectedNote === -1) {
                userNote.push(data);
                displayNoteContent(userNote.length - 1);
            }
            else {
                userNote[selectedNote].noteBody = noteBody;
                userNote[selectedNote].noteTitle = noteTitle;
                userNote[selectedNote].notePreview = notePreview;
            }
            iziToast.success({
                title: 'WEEEE!',
                message: 'Your note has been saved!',
                timeout: 1500
            });
        }
    });
}

function archiveNote (selectedNote){
    let status = 'archived';
    console.log('selected Note: ' + selectedNote);
    saveNote(selectedNote, status);
    closeNoteModal();
}

function displayNoteList() {
    $('.notesList').empty();
    for (var i = 0; i <= userNote.length; i++) {
        $('.notesList').append('<h6>' + userNote[i].noteTitle + '</h6><a href="javascript:void(0);" onclick="displayNoteContent(this.id);" id="' + i + '" class="notePreview">' + userNote[i].notePreview + '</a><hr />');
    }
}

function displayNoteContent(noteID) {
    $("#main").hide();
    $("#newNoteModal").show();
    selectedNote = noteID;
    console.log(selectedNote);
    $('.noteInputZone').val(userNote[selectedNote].noteBody);
    $('.noteTitleInput').val(userNote[selectedNote].noteTitle);
    $('.createdOn').children('p').html(new Date(userNote[selectedNote].createdOn).toDateString());
}

//auto sign in if cookie's here
if (Cookies.get('userid') !== undefined && window.location.pathname === "./auth.html") {
    window.location = "index.html";
}
