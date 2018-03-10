/* global $ */

var main = function() {
    $('.copyright').text('© ' + new Date().getFullYear() +  ' Day2Day, Armitage Design');
};

$(document).ready(main);