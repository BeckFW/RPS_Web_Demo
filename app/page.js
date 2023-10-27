"use client"
import { FilesetResolver, GestureRecognizer, DrawingUtils } from "@mediapipe/tasks-vision";
import { useEffect, useState } from "react"; 


export default function Home () {

  const videoHeight = "360px";
  const videoWidth = "480px";

  const UMConstraints = {
    video: true,
  }

  let lastVideoTime = -1;
  let results = undefined; 
  let webcamRunning = false;
  let video, canvasElement, canvasCtx, gestureOutput, playerMoveDisplay, playerMove; 

  let gestureRecognizer; 

  const setupVision = async () => {
    // Create task for image file processing:
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    return vision; 
  }

  const setupGestureRec = async (vision) => {
    const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/gesture_recognizer.task"
      },
      numHands: 2,
      runningMode: "video", 
    });

    return gestureRecognizer;
  }

  useEffect(()=>{
    // Once the page has loaded // 
    async function assignTasks() {
      const vision = await setupVision(); 
      gestureRecognizer = await setupGestureRec(vision); 
    }
    // Setup GestureRecognition Tasks
    assignTasks();
    // Access document elements
    getDocumentElements();
  }, [])

  // Access document elements // 
  const getDocumentElements = () => {
    try {
    video = document.getElementById("webcam");
    canvasElement = document.getElementById("output_canvas");
    canvasCtx = canvasElement.getContext("2d");
    gestureOutput = document.getElementById("gesture_output");
    playerMoveDisplay = document.querySelector("#playerMoveDisplay");
    console.info("Document elements found"); 
    } catch (error) {
      console.warn('Error accessing document elements'); 
      console.log(error); 
    }
  }

  const enableCam = (e) => { 
    e.preventDefault();
    if (!webcamRunning) {
      webcamRunning = true; 
      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(UMConstraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      });
    } else { 
      let tracks = video.srcObject.getTracks(); 
      tracks.forEach(track => {
        track.stop();
      });
      video.srcObject = null; 
      webcamRunning = false; 
    }

  }


  const predictWebcam = async () => {
    const webcamElement = document.getElementById("webcam");
    // Now let's start detecting the stream.

    let nowInMs = Date.now();
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      results = gestureRecognizer.recognizeForVideo(video, nowInMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasElement.style.height = videoHeight;
    webcamElement.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    webcamElement.style.width = videoWidth;

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          {
            color: "#00FF00",
            lineWidth: 5
          }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 2
        });
      }
    }
    canvasCtx.restore();
    if (results.gestures.length > 0) {
      gestureOutput.style.display = "block";
      playerMoveDisplay.style.display = "block";
      gestureOutput.style.width = videoWidth;
      const categoryName = results.gestures[0][0].categoryName;
      const categoryScore = parseFloat(
        results.gestures[0][0].score * 100
      ).toFixed(2);
      const handedness = results.handednesses[0][0].displayName;

      switch (categoryName) {
        case "Victory":
          playerMove = "Scissors";
          break; 
        case "Closed_Fist":
          playerMove = "Rock"; 
          break;
        case "Open_Palm":
          playerMove = "Paper"; 
          break;
        default:
          playerMove = "None";
          break;
      }

      gestureOutput.innerText = `Confidence: ${categoryScore}%`;
      playerMoveDisplay.innerText = `You Played ${playerMove}!`; 
    } else {
      gestureOutput.style.display = "none";
      playerMoveDisplay.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
}

  return (
      <div>
      <div className='text-center items-center p-10'>
        Gesture Control System
      </div>

      <div id="liveView" className="videoView">
        <button id="webcamButton" className="mdc-button mdc-button--raised">
          <span className="mdc-button__ripple"></span>
          <span className="mdc-button__label" onClick={enableCam}>ENABLE WEBCAM</span>
        </button>
        <div className='relative'>
          <video id="webcam" autoPlay playsInline></video>
          <canvas className="output_canvas absolute left-0 top-0" id="output_canvas" width="1280" height="720"></canvas>
          <p className="text-2xl" id="playerMoveDisplay"></p>
          <p id='gesture_output' className="output"></p>
        </div>
      </div>
    </div>
  )
}
