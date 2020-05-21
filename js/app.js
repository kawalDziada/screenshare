let apiKey = '46750292';
let sessionId = '2_MX40Njc1MDI5Mn5-MTU5MDA0NzU4MjAzOX5nYmlvZVBsandCMjlWYXJJNHV5d1psejZ-fg';
let token = 'T1==cGFydG5lcl9pZD00Njc1MDI5MiZzaWc9NWYxYWM1MWNlMjI5ZWUyNjZjMzQyYzllNGFhYjE4YTBjZTRkM2Y1YTpzZXNzaW9uX2lkPTJfTVg0ME5qYzFNREk1TW41LU1UVTVNREEwTnpVNE1qQXpPWDVuWW1sdlpWQnNhbmRDTWpsV1lYSkpOSFY1ZDFwc2VqWi1mZyZjcmVhdGVfdGltZT0xNTkwMDQ3NjExJm5vbmNlPTAuNzA0MzQ0NDIxNzM3Mzc3MyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTkyNjM5NjEwJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9';
let items = 1;
const mainDiv = document.getElementById('subscriber')
// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function changelayout(appendNumber) {
  console.log(appendNumber)
  if(appendNumber >= 5) {
    mainDiv.classList.add('subscriber-row')
  }
}

function changeBackLayout(appendNumber) {
  if(appendNumber < 5) {
    mainDiv.classList.remove('subscriber-row')
  }
}

let session;
const SERVER_BASE_URL = 'https://pleasebeavailable.herokuapp.com';
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
      handleScreenShare(event.stream.videoType),
      items ++,
      changelayout(items)
    );
  });
  session.on("streamDestroyed", event => {
    document.getElementById("screen").classList.remove("sub-active");
    items --
    changeBackLayout(items)
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
