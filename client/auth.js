/* global $ 
/* global Cookies
global iziToast */

var main = function() {

    var userID,
        avatar;

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
                userID = data._id;
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
                else {
                    window.location = "/index.html";
                }
            }
        });
    });

    $('.signin__link').on('click', function() {
        handleShow('signIn')
    });

    $(".signup__link").on('click', function() {
        handleShow('signUp')
    });

    $('#forgotPassword').on('click', function() {
        handleShow('forgotPassword');
    });

    // request to login
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

    $('#sendResetEmail').on('click', function() {
        resetPasswordRequest();
    });

    $('#updatePassword').on('click', function() {
        let newPassword = $('#password').val();
        resetPassword(newPassword);
    });
};

$(document).ready(main);

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
            if (data._id != undefined) {
                Cookies.remove('userid');
                Cookies.set('userid', data._id);
                // window.location = '/index.html';
            }
        },
    });
}

function resetPassword(newPassword) {
    if (newPassword != $('#passwordRepeat').val()) {
        iziToast.error({
            title: 'Password do not match!',
            message: 'Please try again',
        });
    }
    else if (newPassword === '') {
        iziToast.error({
            title: 'You need to choose a password!'
        });
    }
    else if (newPassword.length < 5) {
        iziToast.warning({
            message: 'Your password needs to be at least 5 character long',
        });
    }
    else {
        let resetPwdToken = window.location.search.split(/\?|&|=/)[2],
            userid = window.location.search.split(/\?|&|=/)[4];
        $.ajax({
            url: "/resetpassword",
            type: 'PUT',
            data: {
                resetPwdToken: resetPwdToken,
                userid: userid,
                newPassword: newPassword
            },
            success: function(data) {
                console.log(data);
                if (data === 'No user match this id') {
                    iziToast.error({
                        title: 'Error!',
                        message: 'No user match this id',
                    });
                }
                else if (data === 'wrong token') {
                    iziToast.error({
                        title: 'Error!',
                        message: 'This token does not belong to this user',
                    });
                }
                else if (data === 'token overdue') {
                    iziToast.error({
                        title: 'Error!',
                        message: 'This token has expired. Please make another request to get a new password',
                    });
                }
                else if (data === 'error') {
                    iziToast.error({
                        title: 'Error!',
                        message: 'Something went wrong... No one knows what yet...',
                    });
                }
                else if (data === 'password updated') {
                    iziToast.success({
                        title: 'Congrats',
                        message: 'Your password has been updated. Click here to go back to sign in',
                        timeout: 50000,
                        buttons: [
                            ['<button type="button" href="http://day2dayapp.net/auth.html">Go to signin page</button>', function(instance, toast) {
                                window.location.replace('http://day2dayapp.net/auth.html');
                            }, true], // true to focus
                        ],
                    });
                }
            }
        });
    }
}

function resetPasswordRequest() {
    let passwordToResetForEmail = $("#passwordToReset").val();
    $.ajax({
        url: "/forget",
        type: 'POST',
        data: {
            passwordToResetForEmail
        },
        success: function(data) {
            if (data === 'succes') {
                iziToast.success({
                    title: 'Found You!',
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

//auto sign in if cookie's here
if (Cookies.get('userid') !== undefined && window.location.pathname === "/auth.html") {
    window.location = "index.html";
}

// handling what to display
function handleShow(section) {
    if (section === 'forgotPassword') {
        $('#signUp, #signIn').hide();
        $('#resetPassword').show();
    }
    else if (section === 'signUp') {
        $('#resetPassword, #signIn').hide();
        $('#signUp').show();
    }
    else if (section === 'signIn') {
        $('#resetPassword, #signUp').hide();
        $('#signIn').show();
    }
}
