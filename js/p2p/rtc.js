const RTC = require("rtc");

// use RTC to quickly create a conference instance
var conference = RTC({
  // use the public google stun servers :)
  ice: [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'stun:stun2.l.google.com:19302' },
    { url: 'stun:stun3.l.google.com:19302' },
    { url: 'stun:stun4.l.google.com:19302' }
  ],
  
  // specify a fixed room for the demo to use
  room: 'MyRoom:asd'
});

// conference is an instance of rtc-quickconnect, so the following resources will be useful
// https://github.com/rtc-io/rtc-quickconnect
// https://github.com/rtc-io/rtc-signaller
