// injection technique borrowed from http://stackoverflow.com/questions/840240/injecting-jquery-into-a-page-fails-when-using-google-ajax-libraries-api
window.onload = function() {
  var script = document.createElement("script");
  script.src = "./inject.js";
  document.body.appendChild(script);
};
