let apiKey = '46744432';
let sessionId = '1_MX40Njc0NDQzMn5-MTU4OTgwMzEyOTExM35ZUnlOYWY0Vlc0TnZ5aktFMVdqT09LWjF-fg';
let token = 'T1==cGFydG5lcl9pZD00Njc0NDQzMiZzaWc9MzNjMTZiMDZlMzRlOGE2NDA1ODI4MjQ3NzlhZTY2ZDRmZDE4M2MyOTpzZXNzaW9uX2lkPTFfTVg0ME5qYzBORFF6TW41LU1UVTRPVGd3TXpFeU9URXhNMzVaVW5sT1lXWTBWbGMwVG5aNWFrdEZNVmRxVDA5TFdqRi1mZyZjcmVhdGVfdGltZT0xNTg5ODAzMTkzJm5vbmNlPTAuNTY2OTkxMDM2MTA2MDcxMyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTkyMzk1MTkyJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9';

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

let session;
const SERVER_BASE_URL = 'https://nextvideoapp.herokuapp.com';
    fetch(SERVER_BASE_URL + '/session').then(function(res) {
      return res.json()
    }).then(function(res) {
      apiKey = res.apiKey;
      sessionId = res.sessionId;
      token = res.token;
      initializeSession(apiKey, sessionId, token);
    }).catch(handleError);

// initializeSession(apiKey, sessionId, token);
function initializeSession(apiKey, sessionId, token) {
  // Create a session object with the sessionId
  session = OT.initSession(apiKey, sessionId);
  // Create a publisher
  const publisher = OT.initPublisher(
    "publisher",
    {
      insertMode: "append",
      width: "100%",
      height: "100%"
    },
    handleCallback
  );
  // Connect to the session
  session.connect(token, error => {
    // If the connection is successful, initialize the publisher and publish to the session
    if (error) {
      handleCallback(error);
    } else {
      session.publish(publisher, handleCallback);
    }
  });
  // Subscribe to a newly created stream
  session.on("streamCreated", event => {
    const streamContainer =
      event.stream.videoType === "screen" ? "screen" : "subscriber";
    session.subscribe(
      event.stream,
      streamContainer,
      {
        insertMode: "append",
        width: "100%",
        height: "100%"
      },
      handleScreenShare(event.stream.videoType)
    );
  });
  session.on("streamDestroyed", event => {
    document.getElementById("screen").classList.remove("sub-active");
  });
}
// Function to handle screenshare layout
function handleScreenShare(streamType, error) {
  if (error) {
    console.log("error: " + error.message);
  } else {
    if (streamType === "screen") {
      document.getElementById("screen").classList.add("sub-active");
    }
  }
}
// Callback handler
function handleCallback(error) {
  if (error) {
    console.log("error: " + error.message);
  } else {
    console.log("callback success");
  }
}
let screenSharePublisher;
const startShareBtn = document.getElementById("startScreenShare");
startShareBtn.addEventListener("click", event => {
  OT.checkScreenSharingCapability(response => {
    if (!response.supported || response.extensionRegistered === false) {
      alert("Screen sharing not supported");
    } else if (response.extensionInstalled === false) {
      alert("Browser requires extension");
    } else {
      screenSharePublisher = OT.initPublisher(
        "screen",
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
          videoSource: "screen",
          publishAudio: true
        },
        handleCallback
      );
      session.publish(screenSharePublisher, handleCallback);
      startShareBtn.classList.toggle("hidden");
      stopShareBtn.classList.toggle("hidden");
      document.getElementById("screen").classList.add("pub-active");
    }
  });
});
const stopShareBtn = document.getElementById("stopScreenShare");
stopShareBtn.addEventListener("click", event => {
  screenSharePublisher.destroy();
  startShareBtn.classList.toggle("hidden");
  stopShareBtn.classList.toggle("hidden");
  document.getElementById("screen").classList.remove("pub-active");
});

setTimeout(() => { 
  if (session) {
    session.disconnect(); 
  }
  alert('Your call has ended after the half-hour') 
}, 540000)

