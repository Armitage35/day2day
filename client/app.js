/* global $
global Cookies 
global iziToast
global location
global analytics
global gapi*/

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
    selectedNote,
    user,
    userPocketReadingList,
    temperatureUnit,
    backgroundTheme,
    successMessage,
    events,
    emptyDaysInMonth;

var main = function() {

    updateClock(); // leave here as this should not execute before DOM is ready 

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
        let requestedGif = $("#message-giphy").val().split(' ').join('+'),
            giphyCall = "https://api.giphy.com/v1/gifs/search?q=" + requestedGif + "&api_key=" + giphyApiKey + "&limit=1",
            giphyResponse = $.getJSON(giphyCall, function() {
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
        $("#dueDate").val(new Date().getFullYear() + "-" + new Date().getDate() + 1 + "-" + new Date().getMonth());
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
        let completedTaskID = selectedTask;
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
        handleTool('background');
    });

    $('#taskTool').on('click', function() {
        handleTool('task');
    });

    $('#noteTool').on('click', function() {
        handleTool('note');
    });

    $('#settingTool').on('click', function() {
        handleTool('settings');
    });

    $('#calendarTool').on('click', function() {
        handleTool('calendar');
    });

    console.log("selected tool: " + Cookies.get('selectedTool'));
    if (Cookies.get('selectedTool') === undefined || Cookies.get('selectedTool') === 'settings') {
        handleTool('task');
    }
    else {
        handleTool(Cookies.get('selectedTool'));
    }

    $(".notePreview").on('click', function() {
        displayNoteContent(selectedNote);
    });

    $(".noteTitleInput").val("Note title");

    $('.createdOn').children('p').html(new Date().toDateString());

    $("#saveNote").on('click', function() {
        saveNote(selectedNote);
    });

    $('#editSettings').on('click', function() {
        editSettingsView();
    });

    $('#saveSettings').on('click', function() {
        // $('.settingsEdit, .settingsView').toggle();
        $('#confirmationModal').modal('toggle');
    });

    $('#settingsConfirmationModalCancel').on('click', function() {
        $('.settingsEdit, .settingsView').toggle();
    });

    $('#settingsConfirmChanges').on('click', function() {
        saveSettingsChanges();
    });

    $('#settingPocketAction').on('click', function() {
        $.ajax({
            url: 'user',
            type: 'PUT',
            data: { operationType: 'removeIntegration', integrations: 'pocket', userID: userID },
            success: function() {
                getUser();
            }
        });
    });

    // checking when the user comes back from Pocket's auth. If so, handle his token
    if (location.search === '?ref=pocketOAuth' && Cookies.get('pocketRequestCode') != undefined) { // make sure that the second condition works or it will erase user's token on reload with arg in url
        let pocketRequestCode = Cookies.get('pocketRequestCode');
        Cookies.remove('pocketRequestCode');

        $.ajax({
            url: 'pocketKeyConfirm',
            type: 'GET',
            data: { pocketRequestCode: pocketRequestCode, userID: userID },
            success: function() {
                getUser();
            }
        });
    }

    // handling user's access to Pocket
    $('#pocketTool').on('click', function() {
        if (user.integrations.pocket.token != undefined) {
            $('#pocketLogin').empty();
            $('#pocketTool').children('svg').removeAttr('data-toggle');
            getPocketUnreadElements();
            handleTool('pocket');
        }
    });

    $('.markRead').on('click', function() {
        let pocketArticleRead = $(this).attr('id');
        markArticleRead(pocketArticleRead);
    });

    $('#addNewPocketLink').on('click', function() {
        $.ajax({
            url: 'addnewpocketarticle',
            type: 'POST',
            data: { url: $('#newPocketArticleLink').val(), pocketToken: user.integrations.pocket.token },
            success: function(data) {
                console.log(data);
                if (data != 'not a link' || data != '400 Bad Request') {
                    $('#newPocketArticleLink').val('');
                    $('#pocketNewArticle').modal('hide');
                    getPocketUnreadElements();
                    displayPocketUnreadElements();
                }
                else {
                    iziToast.error({
                        title: 'Error',
                        message: 'Please submit a valid URL',
                    });
                }
            }
        });
    });

    $('#settingsTemperaturePrefNewValueCelsius').on('click', function() {
        temperatureUnit === "celsius";
    });

    $('#settingsTemperaturePrefNewValueFarenheit').on('click', function() {
        temperatureUnit === "farenheit";
    });

    $('#logOut').on('click', function() {
        logOut();
    });

    $('#closeCalendar').on('click', function() {
        closeCalendar();
    });
};

$(document).ready(main);

function closeCalendar() {
    $('.calendarToolView').hide();
    $('.taskToolView, .noteToolView, .pocketToolView, .settingsToolView, .tool, #main').show();
    handleTool('task');
}

function closeNoteModal() {
    $('#newNoteModal, #main').toggle();
    $('.noteInputZone, .noteTitleInput').val('');
    displayNoteList();
}

function handleTool(selectedTool) {
    function decenterTimeWeather() {
        $('.align-self-center').removeClass('col-11').addClass('col-6');
        $('.pictureCredits').parent().removeClass('col-0').addClass('col-2');
        $('.tool').parent().removeClass('col-0').addClass('col-3');
    }

    $('.accessTools').children().children().children().removeClass('active');

    if (selectedTool != 'calendar') {
        Cookies.set('selectedTool', selectedTool);
    }

    if (selectedTool === 'background') {
        $('.fa-camera-retro').addClass('active');
        $('.tool').hide();
        // enabling the date & time to be centered
        $('.align-self-center').removeClass('col-6').addClass('col-11');
        $('.pictureCredits').parent().removeClass('col-2').addClass('col-0');
        $('.tool').parent().removeClass('col-3').addClass('col-0');
    }
    else if (selectedTool === 'task') {
        $('.fa-tasks').addClass('active');
        $('.tool, .taskToolView').show('slow');
        $('.noteToolView, .pocketToolView, .settingsToolView').hide();
        decenterTimeWeather();
        displayTask();
    }
    else if (selectedTool === 'note') {
        $('.fa-sticky-note').addClass('active');
        $('.tool, .noteToolView').show('slow');
        $('.taskToolView, .pocketToolView, .settingsToolView').hide();
        decenterTimeWeather();
        displayNoteList();
    }
    else if (selectedTool === 'pocket') {
        $('.fa-get-pocket').addClass('active');
        $('.tool, .pocketToolView').show('slow');
        $('.taskToolView, .noteToolView, .settingsToolView').hide();
        decenterTimeWeather();
        getPocketUnreadElements();
    }
    else if (selectedTool === 'settings') {
        $('.fa-cog').addClass('active');
        $('.tool, .settingsToolView').show('slow');
        $('.taskToolView, .noteToolView, .pocketToolView').hide();
        decenterTimeWeather();
        displayUserSettings();
    }
    else if (selectedTool === 'calendar') {
        $('.calendar').addClass('active');
        $('.taskToolView, .noteToolView, .pocketToolView, .settingsToolView, .tool, #main').hide();
        $('.calendarToolView').show('slow');
        updateCalendar();
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

let now = yyyy + '-' + mm + '-' + dd,
    beginingOfDay = new Date(),
    endOfDay = new Date();
beginingOfDay.getTime(beginingOfDay.setHours(0, 0, 0));
beginingOfDay = beginingOfDay.getTime();
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
            displayNoteList();
        }
    });
}

//display time
function updateClock() {
    var now = new Date(),
        hh = now.getHours();

    if (hh < 10) {
        hh = '0' + hh;
    }

    var minutes = now.getMinutes();

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    $(".time").html(hh + ":" + minutes);
    $(".date").html(now.getDate() + " " + month[now.getMonth()] + " ");
}

//getting user avatar
function getUser() {
    $.ajax({
        url: "/user",
        type: 'GET',
        data: { userID },
        success: function(data) {
            userAvatar = data.avatar;
            user = data;
            let userAvatarForBackground = 'url("' + data.avatar + '")';
            $('.userPicture').attr('src', userAvatar);
            $('.avatar').css('background-image', userAvatarForBackground).children('img');
            $('#settingAvatar').attr('src', userAvatar).css('filter', 'none');

            // segment identify
            analytics.identify(user._id, {
                name: user.username,
                avatar: user.avatar,
                email: user.email,
                temperatureUnit: user.settings.temperatureUnit,
                backgroundTheme: user.settings.backgroundPicture,
                integration: user.integrations
            });
        }
    });
}

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
        console.log(j);
        if (selectedView == 0) {
            if (j < endOfDay && j != 0) { //handle displaying today's and late tasks but not empty date tasks
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

        let taskClass;

        // checking if task is en retard
        if (new Date(userTask[i].dueDate) < beginingOfDay && userTask[i].dueDate != null) {
            taskClass = 'task list-group-item lateTask';
        }
        else {
            taskClass = 'task list-group-item';
        }

        $(".taskList").append("<li class='" + taskClass + "' data-mongo='" + userTask[i]._id + "' id='" + i + "'><input type='checkbox' name='task-marker'>" + userTask[i].title + "<br />" + dueDateReadable + "<button type='button' onclick='displayComments()' class='btn btn-link showComments' id='" + userTask[i].id + "'><i class='fa fa-comment' aria-hidden='true'></i> " + userTask[i].commentNb + " </button>" + "</li>");
    }
}

function displayComments() {
    $('.detailsCheckbox').prop('checked', false).attr('id', userTask[selectedTask]._id);
    $(".commentSection").empty();
    $("#newCommentModal").show();
    $("#main").hide();
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
        $('.taskList').append(onboardingInvite);
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
            displayTask();
            $(".onboarding").hide();
        });
    }
}

function completeTask(completedTaskID) {
    let completedTaskMongoID = userTask[completedTaskID]._id;
    analytics.track('completeTask');
    $.ajax({
        url: "todos",
        type: 'PUT',
        data: { id: completedTaskMongoID },
        success: function(data) {
            console.log('task completed');
            $(this).fadeOut();
            iziToast.success({
                title: assignSucessMessage(),
                message: 'Task completed',
                position: 'topRight',
            });
            userTask[completedTaskID].complete = true;
            displayTask();
        }
    });
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
            userTask.pop(); //removing the temp object created by client to replace it with the object from mongo
            userTask.push(result);
            iziToast.success({
                title: assignSucessMessage(),
                message: 'Your task has been saved',
                position: 'topRight',
            });
            analytics.track('New task created', {
                title: new_task,
            });
        });

        $(".task-input input").val("");
        $(".datePicker").hide();
    }
    displayTask();
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
            console.log(data);
        }
    });
    displayComments();
    $('#newCommentModal').show();
    $('#main').hide();
}



//display new background pictures from unsplash
function updateWallpaper() {
    // first we want to check if the user alerady has predefined values for his background. Since waiting for the getUser is too long, we try and check the cookie
    if (Cookies.get('backgroundTheme') != undefined) {
        backgroundTheme = Cookies.get('backgroundTheme');
    }

    $.ajax({
        url: "https://api.unsplash.com/photos/random/?client_id=" + unsplashApiKey + "&orientation=landscape&query=" + backgroundTheme,
        type: 'GET',
        success: function(data) {
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
}


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
        let openWeatherMapUnit,
            openWeatherMapUnitShort;
        if (temperatureUnit === 'celsius' || temperatureUnit == undefined) {
            openWeatherMapUnit = 'metric';
            openWeatherMapUnitShort = "°C";
        }
        else {
            openWeatherMapUnit = ''; // if empty, openWeather expects Farenheit
            openWeatherMapUnitShort = "°F";
        }

        let openWeatherMapReq = "https://api.openweathermap.org/data/2.5/weather?units=" + openWeatherMapUnit + "&lat=" + userIP.latitude + "&lon=" + userIP.longitude + "&appid=" + openWeatherMapApiKey;

        $.get(openWeatherMapReq, function(data) {
            $(".temperature").text(" | " + Math.ceil(data.main.temp) + openWeatherMapUnitShort);
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

function saveNote(selectedNote, noteArchived) {
    let noteBody = $(".noteInputZone").val(),
        noteTitle = $(".noteTitleInput").val(),
        notePreview = noteBody.substring(0, 115) + "...",
        noteLastEditedOn = new Date(),
        noteMongoID = 0;

    if (noteArchived === true) {
        console.log('this note is archived: ' + noteArchived);
    }
    else {
        noteArchived = false;
        console.log('this note is archived: ' + noteArchived);
    }

    // check that note has an ID and is not new
    if (selectedNote != -1) {
        noteMongoID = userNote[selectedNote]._id;
    }

    $.ajax({
        url: 'notes',
        type: 'PUT',
        data: { noteBody: noteBody, noteTitle: noteTitle, notePreview: notePreview, noteLastEditedOn: noteLastEditedOn, userid: userID, noteCreatedOn: new Date(), noteMongoID: noteMongoID, noteArchived: noteArchived },
        success: function(data) {
            if (selectedNote === -1) {
                userNote.push(data);
                displayNoteContent(userNote.length - 1);
                analytics.track('New note created', {
                    noteTitle: noteTitle
                });
            }
            else {
                userNote[selectedNote].noteBody = noteBody;
                userNote[selectedNote].noteTitle = noteTitle;
                userNote[selectedNote].notePreview = notePreview;
            }
            iziToast.success({
                title: assignSucessMessage(),
                message: 'Your note has been saved!',
                timeout: 1000
            });
        }
    });
}

function archiveNote(selectedNote) {
    let noteArchived = true;
    saveNote(selectedNote, noteArchived);
    userNote[selectedNote].archiveNote = true;
    closeNoteModal();
    displayNoteList();
    iziToast.success({
        title: assignSucessMessage(),
        message: 'Your note has been archived!',
        timeout: 1000
    });
}

function displayNoteList() {
    $('.notesList').empty();
    for (var i = 0; i <= userNote.length; i++) {
        if (userNote[i].archiveNote != true) {
            $('.notesList').append('<h6>' + userNote[i].noteTitle + '</h6><a href="javascript:void(0);" onclick="displayNoteContent(this.id);" id="' + i + '" class="notePreview">' + userNote[i].notePreview + '</a><hr />');
        }
    }
}

function displayNoteContent(noteID) {
    $("#main").hide();
    $("#newNoteModal").show();
    selectedNote = noteID;
    $('.noteInputZone').val(userNote[selectedNote].noteBody);
    $('.noteTitleInput').val(userNote[selectedNote].noteTitle);
    $('.createdOn').children('p').html(new Date(userNote[selectedNote].createdOn).toDateString());
}

function connectToPocket() {
    $.ajax({
        url: 'pocketKey',
        type: 'GET',
        data: { userID: userID },
        success: function(data) {
            Cookies.set('pocketRequestCode', data);
            window.location.replace('https://getpocket.com/auth/authorize?request_token=' + data + '&redirect_uri=http://' + window.location.hostname + '?ref=pocketOAuth');
        }
    });
}

function getPocketUnreadElements() {
    $.ajax({
        url: 'getUsersPocketReadList',
        type: 'GET',
        data: { userID },
        success: function(data) {
            console.log(data)
            if (data === '401 Unauthorized') {
                $('.pocketToolView').html('<h4 style="color:black; padding-left:10px; padding-right:10px">Your Pocket account has been deserialized</h4><p style="color:black; padding-left:10px; padding-right:10px">Click here to reconnect your account</p><input class="bttn-unite bttn-sm bttn-primary" type="button" id="connectPocket" value="Connect to Pocket"style="margin-left:10px" onclick="connectToPocket()"/>');
            }
            else {
                userPocketReadingList = JSON.parse(data).list;
                displayPocketUnreadElements(userPocketReadingList);
            }
        }
    });
}

function displayPocketUnreadElements(userPocketReadingList) {
    $('.readingList').empty();
    userPocketReadingList = Object.values(userPocketReadingList);

    for (let i = 0; i < userPocketReadingList.length; i++) {
        let pocketArticleBody = userPocketReadingList[i].excerpt,
            pocketArticleTitle = userPocketReadingList[i].resolved_title,
            pocketArticleContentType;

        if (pocketArticleBody != "") {
            pocketArticleBody = userPocketReadingList[i].excerpt.substring(0, 115) + '...';
        }

        if (userPocketReadingList[i].resolved_title.length > 50) {
            pocketArticleTitle = userPocketReadingList[i].resolved_title.substring(0, 75) + '...';
        }

        // handling article content type
        if (userPocketReadingList[i].is_article === "1") {
            pocketArticleContentType = '<i class="fas fa-newspaper"></i>';
        }
        else if (userPocketReadingList[i].has_video > "0") {
            pocketArticleContentType = '<i class="fab fa-youtube"></i>';
        }
        else {
            pocketArticleContentType = '<i class="fas fa-link"></i>';
        }

        let pocketArticleHTML = '<div><a href="' + userPocketReadingList[i].resolved_url + '" target="_blank" class="list-group-item list-group-item-action flex-column align-items-start"> <div class="d-flex w-100 justify-content-between"> <h5 class="mb-1">' + pocketArticleTitle + '</h5> <small>' + pocketArticleContentType + '</small><small></div><p class="mb-1">' + pocketArticleBody + '</p></a><button class="bttn-minimal bttn-xs bttn-primary markRead" id="' + userPocketReadingList[i].item_id + '" onclick="markArticleRead(' + userPocketReadingList[i].item_id + ')"><i class="fas fa-check"></i> Mark as read</button></small></div>';
        $('.readingList').append(pocketArticleHTML);
    }
}

function markArticleRead(pocketArticleRead) {
    $.ajax({
        url: 'markArticleRead',
        type: 'POST',
        data: { pocketArticleRead: pocketArticleRead, pocketToken: user.integrations.pocket.token },
        success: function(data) {
            console.log(data);
            if (data === '{"action_results":[true],"status":1}') {
                iziToast.success({
                    title: assignSucessMessage(),
                    message: 'This item has been archived',
                    position: 'topRight',
                });
                pocketArticleRead = '#' + pocketArticleRead;
                $(pocketArticleRead).parent().parent().fadeOut('slow');
            }
            else {
                iziToast.error({
                    title: 'Error',
                    message: 'Something went wrong...',
                });
            }
        }
    });
}

function displayUserSettings() {
    let integrationNotConnected = '<i class="far fa-times-circle"></i> Not connected</p>',
        integrationConnected = '<i class="far fa-check-circle"></i> Connected</p>';

    $('#userName').text(user.username);
    $('#userEmail').text(user.email);

    // handle user pref for weather and wallpaper
    if (user.hasOwnProperty('temperatureUnit')) {
        if (user.settings.temperatureUnit === 'celsius') {
            $('#settingsTemperaturePref').text('Celsius (default)');
        }
        else if (user.settings.temperatureUnit === 'farenheit') {
            $('#settingsTemperaturePref').text('Fahrenheit');
        }
    }
    else {
        $('#settingsTemperaturePref').text('Celsius (default)');
    }


    // handling user's pref for bakground
    if (user.hasOwnProperty('backgroundPicture') === false) {
        $('#settingsBackgroundPref').text(backgroundTheme);
    }

    // handle pocket integration and buttons
    if (user.integrations.pocket.connected === !true) {
        $('#settingsPocketStatus').html(integrationNotConnected);
        $('#settingPocketAction').text('Connect').attr('onclick', 'connectToPocket()');
    }
    else {
        $('#settingsPocketStatus').html(integrationConnected);
        $('#settingPocketAction').text('Disconnect');
    }

    // handle google integration and buttons
    if (user.hasOwnProperty('google') === false) {
        $('#settingsGoogleStatus').html(integrationNotConnected);
        $('#settingGoogleAction').text('');
    }
    else {
        $('#settingsGoogleStatus').html(integrationConnected);
        $('#settingGoogleAction').text('Disconnect');
    }
}

function initializeDay2Day() {
    getUser();
    updateWallpaper();
    setInterval(updateWallpaper, 350000); //refresh every 3 minutes
    setInterval(updateClock, 36000);
    handleWeather();
}

function editSettingsView() {
    $('.settingsEdit, .settingsView').toggle();
    $('#userNameNewValue').val(user.username);
    $('#userEmailNewValue').val(user.email);
    $('#settingsBackgroundPrefNewValue').val(backgroundTheme);

    if (temperatureUnit === 'celsius' || user.settings.temperatureUnit === undefined) {
        $('#settingsTemperaturePrefNewValueCelsius').addClass('active');
    }
    else if (temperatureUnit === 'farenheit') {
        $('#settingsTemperaturePrefNewValueFarenheit').addClass('active');
    }
}

function saveSettingsChanges() {
    $('.settingsEdit, .settingsView').toggle();
    $('#confirmationModal').modal('hide');

    let newName = $('#userNameNewValue').val(),
        newBackground = $('#settingsBackgroundPrefNewValue').val();

    $.ajax({
        url: 'user',
        type: 'PUT',
        data: {
            name: newName,
            background: newBackground.split(' ').join('+'),
            temperatureUnit: temperatureUnit,
            userID: userID,
            operationType: 'settingsEdit'
        },
        success: function(data) {
            iziToast.success({
                title: assignSucessMessage(),
                message: 'Your changes have been saved',
                position: 'topRight',
            });
            user.username = newName;
            temperatureUnit = temperatureUnit;
            backgroundTheme = newBackground;
            Cookies.set('backgroundTheme', backgroundTheme);
            displayUserSettings();
            initializeDay2Day();
        }
    });

}

function resetPasswordRequest() {
    let passwordToResetForEmail = user.email;
    $.ajax({
        url: "/forget",
        type: 'POST',
        data: {
            passwordToResetForEmail
        },
        success: function(data) {
            if (data === 'succes') {
                iziToast.success({
                    title: assignSucessMessage(),
                    message: 'We sent an email to your inbox. Use it to reset your password',
                });
            }
            else if (data === 'not an email') {
                iziToast.error({
                    title: 'Careful!',
                    message: 'This doesn\'t seem like it\'s an email...',
                });
            }
            else if (data === 'No user match this email') {
                iziToast.warning({
                    title: 'No account linked to this email',
                    message: 'You first need to create an account.',
                });
            }
        }
    });
}

// handles google sign up
function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;

    $.ajax({
        url: '/googleAuth',
        type: 'POST',
        data: {
            fullName: profile.getName(),
            avatar: profile.getImageUrl(),
            email: profile.getEmail(),
            googleToken: id_token
        },
        success: function(data) {
            console.log(data);
            user = data;
        },
    });
}

function assignSucessMessage() {
    successMessage = ['Youpi', 'Success', 'Wonderful', 'Amazing', 'flabbergasted', 'Magnificent', 'Blown away', 'Gootcha', 'BOUYA', 'Astonishing', 'Boum!', 'Savy', 'A walk in the park', 'Awestruck', 'WEEE', 'Successful', 'Done.', 'Successful as hell', 'BOUYAKA'];
    let successMessageNumber = Math.floor(Math.random() * (successMessage.length - 0) + 0);
    return successMessage[successMessageNumber];
}

function updateCalendar() {
    $('.currentYear').text(new Date().getFullYear());
    $('.currentMonth').text(new Date().toLocaleDateString('en-CA', { month: 'long' }));
    $('.currentDay').text(new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' }));
    $.ajax({
        url: 'calendar',
        type: 'GET',
        data: {},
        success: function(data) {
            emptyDaysInMonth = data.indexOf(1) - 1;

            // finding out where today is at
            let calBox2Change = new Date().getDate() + data.indexOf(1) - 1,
                comingMonthDates = 1;

            calBox2Change = '#calDay' + calBox2Change;
            $(calBox2Change).closest('.grid-cell').attr('id', 'activeDay');

            // filling the calendar up
            for (let i = 0; i <= data.length; i++) {
                calBox2Change = '#calDay' + i;

                if (i < data.indexOf(1)) {
                    $(calBox2Change).html(data[i]).closest('.grid-cell').addClass('previous-month');
                }
                else if (i > Math.max(...data) + 2) {
                    $(calBox2Change).html(comingMonthDates).closest('.grid-cell').addClass('previous-month');
                    comingMonthDates++;
                }
                else {
                    $(calBox2Change).html(data[i]);
                }
            }
        }
    }).then(listUpcomingEvents());
}

initializeDay2Day();

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'none';
    }
    else {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}


function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'timeMax': new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(), // first day of next Month
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 250,
        'orderBy': 'startTime'
    }).then(function(response) {
        var events = response.result.items;
        displayEvents(events);
    });
}

function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyAP73x2kFNGK6I6joLC-QDVdV9Orx-QyhI',
        clientId: '341494480508-p7e3ctne7n20r38f7rqqi37hv11furan.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.readonly"
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function displayEvents(events) {
    if (events.length > 0) {
        for (let i = 0; i < events.length; i++) {
            let min = new Date(events[i].start.dateTime).getMinutes(),
                dayToActivate = new Date(events[i].start.dateTime).getDate() + emptyDaysInMonth;
            dayToActivate = '#calDay' + dayToActivate;

            if (min === 0) {
                min = '00';
            }

            let event = '<div class="col-5"><p>' + new Date(events[i].start.dateTime).getDate() + ' ' + new Date(events[i].start.dateTime).toLocaleString('en-CA', { month: "long" }) + '</p><p class="calEventHour">' + new Date(events[i].start.dateTime).getHours() + ':' + min + '</p></div><p class="col-7">' + events[i].summary + '</p></div>';

            $('.calEvent').append(event);
            $(dayToActivate).closest('.grid-cell').addClass('dayHasEvent');
        }
    }
    else {
        $('.calEvent').append('No upcoming events found.');
    }
}

function createNewNote() {
    displayNoteContent(-1);
    $('.noteInputZone .noteTitleInput').val('');
}

function logOut() {
    Cookies.remove('userid');
    Cookies.remove('backgroundTheme');
    Cookies.remove('selectedTool');
    window.location.replace("/auth.html");
}

function uploadAvatar() {
    $('#settingsAvatarUserID').val(userID);
    $('#settingsAvatarIsAvatar').val(true);
}

//auto sign in if cookie's here
if (Cookies.get('userid') !== undefined && window.location.pathname === "./auth.html") {
    window.location = "index.html";
}
