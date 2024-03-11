"use client"
import Timer from "@/components/timer";
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";
import axios from "axios";


export default function Home() {

    // State Variables // 

    // Camera State
    const [camEnabled, setCamEnabled] = useState(false); 
    
    // Scores
    const [playerScore, setPlayerScore] = useState(0); 
    const [npcScore, setNpcScore] = useState(0); 

    // Player States (for UI)
    const [playerWonRound, setPlayerWonRound] = useState(false); 
    const [npcWonRound, setNpcWonRound] = useState(false); 
    const [currentPlayerMove, setCurrentPlayerMove] = useState("");
    const [currentNpcMove, setCurrentNpcMove] = useState(""); 

    // Game State Variables
    const [gameRunning, setGameRunning] = useState(false); 
    const [timerRunning, setTimerRunning] = useState(false); 
    const [matchRunning, setMatchRunning] = useState(false); 
    const [gameInProgress, setGameInProgress] = useState(false); 

    // Canvas for capturing images from webcam
    const hiddenCanvasRef = useRef(null);

    // Countdown length
    const TIMER_LENGTH = 3; 

    // Configuration Object for UserManager (Webcam access)
    const UMConfig = {
        video: true
    }

    // Global variables
    let video, hiddenCanvas, context, result; 

    // Run once after first render to find elements
    useEffect(()=>{
        findElements();
        console.log("Found elements");  
    }, []);

    // Control UI for celebrating win/loss
    // Run when playerWonRound or npcWonRound is updated
    useEffect(()=>{
        if (playerWonRound) {
            //alert("You win this round!"); 
            setInterval(()=>{
                setPlayerWonRound(false);
            }, 2000);
        }
        if (npcWonRound) {
            //alert("Better luck next time!"); 
            setInterval(()=>{
                setNpcWonRound(false);
            }, 2000); 
        }
    }, [playerWonRound, npcWonRound]); 

    // Functions // 

    const findElements = () => {
        video = document.querySelector("#webcam");
        hiddenCanvas = hiddenCanvasRef.current; 
        context = hiddenCanvas.getContext("2d"); 
        result = document.querySelector("#result-photo"); 
    }
    
    const startCamera = () => {
        if (!camEnabled) {
            video = document.querySelector('#webcam')
            // Activate the webcam stream.
            navigator.mediaDevices.getUserMedia(UMConfig)
                .then((stream) => {
                    video.srcObject = stream;
                    setCamEnabled(true);
                })
                .catch((error) => {
                    toast.error("Unable to launch camera", {
                        description: "Ensure your camera is connected and permissions are granted for this site.",
                        duration: 5000,
                    });
                });
             
        }
    }

    const startGame = () => {
        if (camEnabled) {
            setGameRunning(true); 
            console.log("Game Running"); 

            runCountdown();

        } else {
            toast.warning("Please enable your camera to start the game.");
        }
        
    }

    const stopGame = () => {
        setGameRunning(false);
        console.log("Game Stopped"); 
    }


    const nextTurn = () => {
        if (currentPlayerMove || currentNpcMove) {
            setCurrentPlayerMove(""); 
            setCurrentNpcMove(""); 
        }
        runCountdown(); 
    }

    const runCountdown = () => {
        setGameInProgress(true); 
        setTimerRunning(true); 
    }

    const capturePlay = () => {
        findElements(); // ensure that all elements are available
        setTimerRunning(false);
        console.log(video.videoWidth); 
        console.log(video.videoHeight);

        hiddenCanvas.width = video.videoWidth; 
        hiddenCanvas.height = video.videoHeight; 

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); 

        const data = hiddenCanvas.toDataURL("image/png"); 
        result.setAttribute("src", data); 

        // Call Gesture API with captured image
        recogniseGesture(data); 

        console.log("Turn captured!"); 
 
    }

    const recogniseGesture = async (image) => {

        let result;

        // Re-encode Image from browser base64->binary buffer
        const base64Image = image.split(',')[1]; 
        const imageBuffer = Buffer.from(base64Image, 'base64'); 

        console.log('Sending request');

        try {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'http://localhost:3100/gestures/recognise',
                headers: { 
                  'Content-Type': 'image/png'
                },
                data: imageBuffer
              };
              
              axios.request(config)
              .then((response) => {
                // Send result back
                console.log(response.data);
                result = {
                    response: response.data,
                    }

                    calculateResult(result); 
                })
              .catch((error) => {
                console.log(error); 
                alert("Unable to register your move, no points have been added. " + error.response.data); 
              });

        } catch (error) {
            console.warn(error); 
            alert("Something went wrong");
        }

    }

    const calculateResult = async (result) => {
        // use RPS API to find result of game

        axios.get(`http://localhost:3100/moves/respond?moveID=${result.response}`)
        .then((moveResponse)=>{
            console.log(moveResponse.data.move);

        setCurrentPlayerMove(result.response);
        setCurrentNpcMove(moveResponse.data.move.move); 

        console.log(moveResponse.data.move.type);

        if (moveResponse.data.move.type == "loss") {
            setPlayerWonRound(true); 
            setPlayerScore(playerScore=>playerScore+1); 
        } else {
            setNpcWonRound(true); 
            setNpcScore(npcScore=>npcScore+1);
        }
        // Finish turn, allow user to play again
        setGameInProgress(false); 
        });
    }
    

    return(
        <div>
            <div className="bg-white bg-full text-black mt-10 w-full px-2">
                <div className="flex flex-col mb-10 align-center text-center">
                <div className="text-2xl font-semibold">Rock, Paper, Scissors!</div>
                <div className="px-20 text-md font-light">Play this classic game against a computer oponent. Use normal hand gestures in-front of the webcam to play!</div>
                </div>
            <div id="scores" className="flex flex-row justify-center gap-24 mb-8">
                <div className="flex flex-col">
                    <div className="px-10 font-bold">{playerScore}/5</div>
                    <div className="self-center font-light text-sm pt-2">Move: {currentPlayerMove}</div>
                </div>
                <div className="font-bold text-xl">Score</div>
                <div className="flex flex-col">
                    <div className="px-10 font-bold">{npcScore}/5</div>
                    <div className="self-center font-light text-sm pt-2">Move: {currentNpcMove}</div>
                </div>
            </div>
            <div id="gameplay-section" className="flex flex-row justify-center min-h-48 ">
                <div id="webcam-container" className="w-1/4 min-w-32 bg-sky-300 flex justify-center items-center relative overflow-hidden ">
                    <video id="webcam" autoPlay  playsInline className={`h-full scale-150 ${!camEnabled && "hidden"}`}></video>
                    {!camEnabled && <button onClick={startCamera} className="px-2 py-2 bg-sky-100 rounded hover:bg-sky-50">Start Camera</button>}
                </div>
                <div id="countdown" className="px-10 flex flex-col justify-center">
                    <div className="text-md py-1">Next Play in...</div>
                    <Timer isRunning={timerRunning} seconds={TIMER_LENGTH} onFinish={capturePlay}/>
                </div>

                <div id="npc-view" className="w-1/4 min-w-32 bg-sky-300 p-10 "></div>

            </div>
            <div id="buttons" className="flex flex-row gap-10 mt-8 justify-center">
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button>Restart</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-50 hover:bg-sky-300">
                <button onClick={gameRunning ? stopGame : startGame}>{gameRunning ? "Stop" : "Start"}</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button onClick={nextTurn}>Next Turn</button>
            </div>
            </div>
            <div className="flex justify-center items-center text-center">
                {playerWonRound && "You Win!"}
                {npcWonRound && "Better Luck Next Time!"}
            </div>
            </div>
            <div className="flex justify-center pt-10 hidden">
                <img className="w-2/3 rounded drop-shadow-xl" id="result-photo"></img>
            </div>
            <div className="hidden">
                <canvas ref={hiddenCanvasRef} id="hidden-canvas"></canvas>
            </div>
        </div>
    )
}