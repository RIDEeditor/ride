"use strict";

const Peer = require("peerjs");
const {desktopCapturer} = require("electron");
window.$ = window.jQuery = require("jquery");

$(function() {
  var isCameraInput = true;
  var messages = [];
  var peerID;
  var name;
  var conn;

  var peer = new Peer({key: "lwjd5qra8257b9"});

  peer.on("open", function() {
    $("#id").text(peer.id);
  });

  function onGetUserMediaError(error) {
    console.log(error);
    alert("An error occured. Please try again");
  }

  function onGetUserMedia(stream) {
    window.localStream = stream;
    onReceiveStream(stream, "my-camera");
  }

  navigator.webkitGetUserMedia({audio: true, video: true}, onGetUserMedia, onGetUserMediaError);

  function toggleMediaInput() {
    if (isCameraInput) {
      // Switch to screen input
      desktopCapturer.getSources({types: ["window"]}, function(error, sources) {
        if (error) throw error;
        for (let i = 0; i < sources.length; ++i) {
          if (sources[i].name === "RIDE Editor") {
            navigator.webkitGetUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: sources[i].id
                }
              }
            }, onGetUserMedia, onGetUserMediaError);
          }
        }
      });
      isCameraInput = false;
    } else {
      // Switch to camera input
      navigator.webkitGetUserMedia({audio: true, video: true}, onGetUserMedia, onGetUserMediaError);
      isCameraInput = true;
    }
  }

  $("#switch-input").on("click", toggleMediaInput);

  function onReceiveStream(stream, elementID) {
    var video = $("#" + elementID + " video")[0];
    video.src = window.URL.createObjectURL(stream);
    window.peerStream = stream;
  }

  $("#login").click(function() {
    name = $("#name").val();
    peerID = $("#peer_id").val();
    if (peerID) {
      conn = peer.connect(peerID, {metadata: {
        username: name
      }});
      conn.on("data", handleMessage);
    }

    $("#chat").removeClass("hidden");
    $("#connect").addClass("hidden");
  });

  peer.on("connection", function(connection) {
    conn = connection;
    peerID = connection.peer;
    conn.on("data", handleMessage);

    $("#peer_id").addClass("hidden").val(peerID);
    $("#connected_peer_container").removeClass("hidden");
    $("#connected_peer").text(connection.metadata.username);
  });

  function handleMessage(data) {
    messages.push(data);
	$("#messages").append('<li><span class="from">' + data.from + ':</span> ' + data.text + '</li>');
    $("#messages-container").animate({scrollTop: $(document).height()}, 0);
  }

  function sendMessage() {
    var text = $("#message").val();
    var data = {from: name, text: text};

    conn.send(data);
    handleMessage(data);
    $("#message").val("");
  }

  $("#message").keypress(function(e) {
    if (e.which === 13) {
      sendMessage();
    }
  });

  $("#send-message").click(sendMessage);

  $("#call").click(function() {
    console.log("now calling: " + peerID);
    console.log(peer);
    var call = peer.call(peerID, window.localStream);
    call.on("stream", function(stream) {
      window.peerStream = stream;
      onReceiveStream(stream, "peer-camera");
    });
  });

  peer.on("call", function(call) {
    onReceiveCall(call);
  });

  function onReceiveCall(call) {
    call.answer(window.localStream);
    call.on("stream", function(stream) {
      window.peerStream = stream;
      onReceiveStream(stream, "peer-camera");
    });
  }
});
