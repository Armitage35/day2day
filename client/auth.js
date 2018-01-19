/* global $ */
/* global Cookies */

var main = function() {

    var userID,
        avatar;

    //auto sign in if cookie's here
    if (Cookies.get('userid') !== undefined && window.location.pathname === "/auth.html") {
        window.location = "index.html";
    }

    //posting auth info from auth.html
    $("#createAccount").on("click", function() {
        $.ajax({
            url: "/user",
            type: 'POST',
            data: {
                username: $("#username").val(),
                email: $("#email").val(),
                password: $("#password").val(),
                passwordRepeat: $("#passwordRepeat").val()
            },
            success: function(data) {
                userID = data.user._id;
                avatar = data.avatar;
                console.log("id: " + userID + " avatar: " + avatar);

                if (userID != undefined) {
                    Cookies.remove('userid');
                    Cookies.set('userid', userID);
                    window.location = "/index.html";
                }

                //show alerts in auth page
                if (data.includes('E1') === true) {
                    console.log("Need a valid email");
                    $("#email").parent().addClass("has-danger").append('<div class="form-control-feedback">Please use a valid email</div>');
                }
                if (data.includes('E2') === true) {
                    console.log('Password do not match');
                    $("#passwordRepeat").parent().addClass("has-danger").append('<div class="form-control-feedback">Password do not match</div>');
                }
                if (data.includes('E3') === true) {
                    console.log('Password should be at least 5 character long');
                    $("#password").parent().addClass("has-danger").append('<div class="form-control-feedback">Password should have more than 5 character </div>');
                }
                if (data.includes('E4') === true) {
                    console.log('email taken');
                    $("#email").parent().addClass("has-danger").append('<div class="form-control-feedback">Email alerady used</div>');
                }
            }
        });
    });

    //togelling between sign in and sign up
    $(".signin__link, .signup__link").on('click', function() {
        $("#signUp").toggle();
        $("#signIn").toggle();
    });

    //request to login
    $("#login").on("click", function() {
        $.ajax({
            url: "/login",
            type: 'POST',
            data: {
                username: $("#emailLogIn").val(),
                password: $("#passwordLogIn").val(),
            },
            success: function(data) {
                console.log(data);
                if (data === "not found") {
                    console.log("wrong credentials")
                    $("#emailLogIn").parent().addClass("has-danger").append('<div class="form-control-feedback">Credentials do not match</div>');
                }
                else {
                    Cookies.set('userid', data);
                    window.location.replace("/index.html");
                }
            }
        });
    });
};

$(document).ready(main);
