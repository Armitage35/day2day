var selectedTask,userTask=[],selectedView=0,gif,giphyApiKey="kSMEAA5V3mBfL5qUeC1ZleR6PdGDa1mV",unsplashApiKey="d9dbf001ba658ce6d8172a427b1a7a3e986aa970d038aade36ff7c54b05ffb0e",openWeatherMapApiKey="d4dafd356c01ea4b792bb04ead253af1",userAvatar,userID,selectedTool="task",main=function(){$(".taskList").on("click","button",function(){selectedTask=$(this).parent().attr("id");displayComments();console.log(selectedTask)});$("#addGif").on("click",function(a){$("#waitingGif").empty();addComment(gif);displayTask();
displayComments();$("#giphyRequest").val("")});$("#testGif").on("click",function(a){$(".testGif").remove();$("#addGif").show();a="https://api.giphy.com/v1/gifs/search?q\x3d"+$("#message-giphy").val().split(" ").join("+")+"\x26api_key\x3d"+giphyApiKey+"\x26limit\x3d1";var b=$.getJSON(a,function(){gif='\x3cimg src\x3d"'+b.responseJSON.data[0].images.preview_gif.url+'" class\x3d"gif';$(".commentSection").append('\x3cdiv class\x3d"row comment testGif"\x3e \x3cdiv class\x3d"col-1"\x3e \x3cimg src\x3d'+
userAvatar+' class\x3d"avatarComment"\x3e \x3c/div\x3e \x3cdiv class\x3d"col-11"\x3e \x3cdiv class\x3d"bubble"\x3e'+gif+'" \x3e \x3c/div\x3e\x3cp class\x3d"timeStamp "\x3e6th january, 15h28\x3c/p\x3e\x3c/div\x3e\x3c/div\x3e')})});$("#textComment").on("click",function(a){handleCommentType("text")});$("#giphyComment").on("click",function(a){handleCommentType("gif")});$("#pictureComment").on("click",function(a){handleCommentType("picture")});$("#addComment").on("click",function(){var a={commentContent:$("#message-text").val(),
commentCreatedOn:new Date,commentModifiedOn:new Date};""!=a.commentContent&&null!=a.commentContent&&void 0!=a.commentContent&&($("#message-text").val(""),a=a.commentContent.replace(/\n\r?/g,"\x3cbr /\x3e"),addComment(a),displayTask(),displayComments())});$("#closeNewCommentModal").on("click",function(){$("#newCommentModal, #main").toggle()});$("#plusButton").on("click",function(a){addTask()});$("#newTask").on("keypress",function(a){13===a.keyCode&&addTask()});$("#calendarButton").on("click",function(a){$(".datePicker").toggle();
$("#dueDate").val((new Date).getFullYear()+"-"+(new Date).getMonth()+1+"-"+(new Date).getDate())});$("#myModal").on("shown.bs.modal",function(){$("#myInput").focus()});$(document).on("keypress",function(a){10!=a.keyCode&&13!=a.keyCode||!a.ctrlKey||$("#fixedBottom").click()});$("#today").on("click",function(){selectedView=0;selectedTaskViewHandler(selectedView)});$("#upcoming").on("click",function(){selectedView=1;selectedTaskViewHandler(selectedView)});$("#backlog").on("click",function(){selectedView=
2;selectedTaskViewHandler(selectedView)});$(".detailsCheckbox").on("click",function(){$("#newCommentModal, #main").toggle();completeTask(selectedTask)});$(".taskList").on("click","input",function(){$(this).parent().fadeOut();var a=$(this).parent().attr("id");completeTask(a)});$("#backgroundTool").on("click",function(a){handleTool("background")});$("#taskTool").on("click",function(a){handleTool("task")});console.log(Cookies.get("selectedTool"));void 0===Cookies.get("selectedTool")?handleTool("task"):
handleTool(Cookies.get("selectedTool"));$("#addFile").on("click",function(a){a=$("#message-file").serializeArray();var b=$("#fileInput")[0].files;console.log(b);for(var c=new FormData,d=0;d<b.length;d++)c.append(b[d].name,b[d]),console.log(b[d].name),console.log(b[d]);console.log(c);$(a).each(function(a,b){c.append(b.name,b.value)});console.log(c);$.ajax({url:"/file",method:"post",data:c,contentType:!1,processData:!1,error:function(a){alert("Error")}})})};$(document).ready(main);
function handleTool(a){$(".accessTools").children().children().children().removeClass("active");Cookies.set("selectedTool",a);"background"===a?($(".fa-camera-retro").addClass("active"),$(".tool").hide("slow")):"task"===a&&($(".fa-tasks").addClass("active"),$(".tool").show("slow"))}var dd=(new Date).getDate(),mm=(new Date).getMonth()+1,yyyy=(new Date).getFullYear(),month="Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec".split(" ");10>dd&&(dd="0"+dd);10>mm&&(mm="0"+mm);
var now=yyyy+"-"+mm+"-"+dd,beginingOfDay=new Date;beginingOfDay.getTime(beginingOfDay.setHours(0,0,0));beginingOfDay=beginingOfDay.getTime();var endOfDay=new Date;endOfDay.setHours(23,59,59);endOfDay=endOfDay.getTime();void 0==Cookies.get("userid")?window.location.replace("/auth.html"):(userID=Cookies.get("userid"),$.ajax({url:"todos",type:"GET",data:{userID:userID},success:function(a){console.log(userID);userTask=a;console.log(userTask);displayTask()}}));
$.ajax({url:"/user",type:"GET",data:{userID:userID},success:function(a){userAvatar=a.avatar;$(".userPicture").attr("src",userAvatar)}});function selectedTaskViewHandler(a){0===a?$("#selectedTaskView").text("Today"):1===a?$("#selectedTaskView").text("Upcoming"):2===a&&$("#selectedTaskView").text("Backlog");displayTask()}
function displayTask(){$(".taskList").empty();onboarding();for(var a=0;a<=userTask.length;a++){var b=new Date(userTask[a].dueDate);b=b.getTime();0==selectedView?b>beginingOfDay&&b<endOfDay&&displayTaskDetails(a):1==selectedView?b>endOfDay&&displayTaskDetails(a):2==selectedView&&displayTaskDetails(a)}}
function displayTaskDetails(a){if(0==userTask[a].complete){var b=new Date(userTask[a].dueDate);b=b.toDateString();"Wed Dec 31 1969"==b&&(b="");$(".taskList").append("\x3cli class\x3d'task list-group-item' data-mongo\x3d'"+userTask[a]._id+"' id\x3d'"+a+"'\x3e\x3cinput type\x3d'checkbox' name\x3d'task-marker'\x3e"+userTask[a].title+"\x3cbr /\x3e"+b+"\x3cbutton type\x3d'button' onclick\x3d'displayComments()' class\x3d'btn btn-link showComments' id\x3d'"+userTask[a].id+"'\x3e\x3ci class\x3d'fa fa-comment' aria-hidden\x3d'true'\x3e\x3c/i\x3e "+
userTask[a].commentNb+" \x3c/button\x3e\x3c/li\x3e")}}
function displayComments(){$(".detailsCheckbox").prop("checked",!1);console.log(selectedTask);$(".commentSection").empty();$("#newCommentModal").show();$("#main").hide();$(".detailsCheckbox").attr("id",userTask[selectedTask]._id);$("#textComment").addClass("active");var a=(new Date(userTask[selectedTask].createdOn)).toLocaleDateString();if(userTask[selectedTask].dueDate){var b=(new Date(userTask[selectedTask].dueDate)).toLocaleDateString();$(".dueFor").children("p").empty().text(b)}$(".commentTaskTitle").text(userTask[selectedTask].title);$(".createdOn").children("p").empty().text(a);
if(0===userTask[selectedTask].commentNb)$(".commentSection").append("\x3cp class\x3d'commentColdState'\x3eYou have no comments yet\x3cp\x3e");else if(0!=userTask[selectedTask].commentNb)for(a=0;a<userTask[selectedTask].commentNb;a++)$(".commentSection").append('\x3cdiv class\x3d"row comment"\x3e \x3cdiv class\x3d"col-1"\x3e \x3cimg src\x3d'+userAvatar+' class\x3d"avatarComment"\x3e \x3c/div\x3e \x3cdiv class\x3d"col-11"\x3e \x3cdiv class\x3d"bubble"\x3e \x3cp class\x3d"commentBody"\x3e'+userTask[selectedTask].comment[a]+
'\x3c/p\x3e \x3c/div\x3e \x3cp class\x3d"timeStamp"\x3e\x3c/p\x3e \x3c/div\x3e \x3c/div\x3e');else $(".taskComments").append("\x3cp\x3eNo comment has been added to this task yet\x3c/p\x3e")}
function onboarding(){0===userTask.length&&($(".taskList").append('\x3cdiv class\x3d"onboarding"\x3e \x3cp class\x3d"text-center"\x3e Is this your first time? \x3c/p\x3e\x3cdiv class\x3d"row justify-content-center"\x3e \x3cbutton type\x3d"button" class\x3d"bttn-unite bttn-sm bttn-primary" id\x3d"onboardingBttn"\x3eShow me around\x3c/button\x3e \x3c/div\x3e \x3c/div\x3e'),$("#onboardingBttn").on("click",function(a){userTask.push({title:"Start by adding a task",complete:!1,createdOn:new Date,dueDate:new Date,
commentNb:0});userTask.push({title:"Then complete a task by clicking in the checkbox",complete:!1,createdOn:new Date,dueDate:new Date,commentNb:0});userTask.push({title:"You can even add comments and Giphy gifs to your tasks",complete:!1,createdOn:new Date,dueDate:new Date,commentNb:0});displayTask();console.log(userTask);$(".onboarding").hide()}))}
function completeTask(a){$.ajax({url:"todos",type:"PUT",data:{id:userTask[a]._id},success:function(a){console.log("Task completed");console.log(a)}});userTask[a].complete=!0;displayTask()}
function addTask(){if(""!==$("#newTask").val()){var a=$("#newTask").val();$("#newTask").val("");var b=new Date($("#dueDate").val());b.setDate(b.getDate()+1);"Invalid Date"==b&&(b=null);a={title:a,complete:!1,createdOn:new Date,dueDate:b,commentNb:0,comment:[],userID:userID};userTask.push(a);$.post("todos",{userTasks:a},function(a){console.log(a);userTask.pop();userTask.push(a);console.log(userTask)});$(".task-input input").val("");$(".datePicker").hide();displayTask()}}
function addComment(a){userTask[selectedTask].comment.push(a);userTask[selectedTask].commentNb++;$.ajax({url:"todos/comment",type:"PUT",data:{id:userTask[selectedTask]._id,comment:a,commentNb:userTask[selectedTask].commentNb},success:function(a){console.log("comment added to the task");console.log(a)}});displayComments();$("#main, #newCommentModal").toggle()}
function updateWallpaper(){$.ajax({url:"https://api.unsplash.com/photos/random/?client_id\x3d"+unsplashApiKey+"\x26orientation\x3dlandscape\x26query\x3dnature",type:"GET",success:function(a){console.log(a);var b;2E3<=window.screen.width?b='url("'+a.urls.full+'")':2E3>window.screen.width&&(b='url("'+a.urls.regular+'")');$("body").css("background-image",b);$(".thanks").html('\x3ca href\x3d"'+a.user.links.html+'?utm_source\x3dday2day\x26utm_medium\x3dreferral" target\x3d"_blank" \x3eA picture by '+a.user.name+
" | Unsplash \x3c/a\x3e")}});setInterval(updateWallpaper,18E4)}updateWallpaper();function updateClock(){now=new Date;$(".time").html(now.getHours()+":"+now.getMinutes());$(".date").html(now.getDate()+" "+month[now.getMonth()]+" ");setInterval(updateClock,2E3)}updateClock();
function handleWeather(){function a(){$.getJSON("https://freegeoip.net/json/"+c,function(a){c=a;b()})}function b(){$.get("https://api.openweathermap.org/data/2.5/weather?units\x3dmetric\x26lat\x3d"+c.latitude+"\x26lon\x3d"+c.longitude+"\x26appid\x3d"+openWeatherMapApiKey,function(a){$(".temperature").text(" | "+Math.ceil(a.main.temp)+" \u00b0C")})}var c;(function(){$.getJSON("https://api.ipify.org?format\x3djsonp\x26callback\x3d?",function(b){c=b.ip;a()})})()}
function handleCommentType(a){$(".newCommentInputZone").children().hide();$(".commentButtons").children().children().removeClass("active");"text"===a?$("#message-text, #addComment").show():"gif"===a?$("#message-giphy, #testGif").show():"picture"===a&&$("#message-file, #addFile").show();$(this).children().addClass("active")}handleWeather();displayTask();void 0!==Cookies.get("userid")&&"./auth.html"===window.location.pathname&&(window.location="index.html");