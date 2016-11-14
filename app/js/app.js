var work = require('./components/work');
var $ = jQuery = require('jquery');
var bootstrap = require('bootstrap');
//
$('.test').text('Yo, bro');

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

console.log('app-js');
console.log(work);
