"use client"
import Timer from "@/components/timer";
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";
import axios from "axios";
import MenuButton from "@/components/menu-button";


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
    const API_URL = "http://localhost:3100"
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
    
    const startCamera = (runGame) => {
        if (!camEnabled) {
            video = document.querySelector('#webcam')
            // Activate the webcam stream.
            navigator.mediaDevices.getUserMedia(UMConfig)
            .then((stream) => {
                // Assign stream to video element
                video.srcObject = stream;
                // Set camEnabled state
                setCamEnabled(true);
                // If triggered from start camera Toast, start the game too
                if (runGame) startGame(true);
            })
            .catch((error) => {
                console.log(error);
                toast.error("Unable to launch camera", {
                    description: "Ensure your camera is connected and permissions are granted for this site.",
                    duration: 5000,
                });
            });  
        }
    }

    const startGame = async (skipCheck) => {
        // Start the game, check camera and setup UI etc
        if (camEnabled || skipCheck == true) {
            setGameRunning(true); 
            console.log("Game Running"); 

        } else {
            toast.info("This game requires access to your camera.", {
                duration: 5000,
                action: {
                    label: "Start Camera",
                    onClick: ()=>startCamera(true),
                }
            }); 

        }
        
    }

    const stopGame = () => {
        setGameRunning(false);
        console.log("Game Stopped"); 
    }

    const startMatch = () => {
        // Start the match and run the countdown
        setMatchRunning(true);
        runCountdown();
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

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: API_URL + '/gestures/recognise',
            headers: { 
                'Content-Type': 'image/png'
            },
            data: imageBuffer
            };
            
        axios.request(config)
        .then((response) => {
            // Send result back
            console.log("Gesture Found: " + response.data);
            calculateResult(response.data); 
        })
        .catch((error) => {
            console.log(error); 
            toast.error("Unable to register your move. No points have been added.", {
                description: error.response?.data || error.message,
            }); 
        });
    }

    const calculateResult = async (result) => {
        // use RPS API to find result of game

        console.log("RESULT: " + result);
        axios.get(API_URL + `/moves/respond?moveID=${result}`)
        .then((moveResponse)=>{
            console.log(moveResponse);
            console.log(moveResponse.data.move);

            setCurrentPlayerMove(result);
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
            })
        .catch((error) => {
            toast.error("Unable to generate AI move. No points have been added.");
        });
    }

    return(
        <div className="">
            <div className="bg-white dark:bg-zinc-800 bg-full text-black dark:text-white pt-12 w-full h-screen px-2">
                <div className={`${gameRunning && "hidden"} flex flex-col mb-10 content-center align-center text-center`}>
                <div className="text-3xl font-semibold">Rock, Paper, Scissors!</div>
                <div className="px-5 mt-2 text-sm dark:text-zinc-300 font-light">Play this classic game against a computer oponent. Use normal hand gestures in-front of the webcam to play!</div>
                </div>
            <div id="scores" className={`${!gameRunning && "hidden"} flex flex-row justify-center mb-8`}>
                <div className="flex flex-col">
                    <div className="px-10 font-bold">&#128587; {playerScore}/5</div>
                    <div className="self-center font-light text-sm dark:text-zinc-300 pt-2">Move: {currentPlayerMove}</div>
                </div>
                <div className="font-bold text-xl">Score</div>
                <div className="flex flex-col">
                    <div className="px-10 font-bold">&#129302; {npcScore}/5</div>
                    <div className="self-center font-light text-sm dark:text-zinc-300 pt-2">Move: {currentNpcMove}</div>
                </div>
            </div>

            <div id="gameplay-menu" className={`${gameRunning && "hidden"} flex justify-center text-center items-center p-10`}>
                <ul className="flex flex-col gap-6">
                    <li>
                        <MenuButton action={startGame}>Play</MenuButton>  
                    </li>
                    <li>
                        <MenuButton>Restart</MenuButton> 
                    </li>
                    <li>
                        <MenuButton>GitHub</MenuButton>
                    </li>
                </ul>
            </div>

            <div id="gameplay-section" className={`${!gameRunning && "hidden"} flex flex-col justify-center min-h-48 px-10`}>
                <div id="webcam-container" className=" aspect-[16/9] bg-sky-300 flex justify-center items-center relative overflow-hidden ">
                    <video id="webcam" autoPlay  playsInline className={`${!camEnabled && "hidden"}`} style={{transform: 'scaleX(-1)', minWidth: '100%', minHeight: '100%'}}></video>
                    {!camEnabled && <button onClick={startCamera} className="px-2 py-2 bg-sky-100 rounded hover:bg-sky-50">Start Camera</button>}
                </div>

                {/* START MATCH */}
                <div className={`${matchRunning && "hidden"} px-10 py-5 flex flex-row items-center justify-center`}>
                    <MenuButton action={startMatch}>Go!</MenuButton>
                </div>
                {/* END START MATCH */}

                {/* COUNTDOWN */}
                <div id="countdown" className={`${!matchRunning && "hidden" } px-10 py-5 flex flex-row items-center justify-center`}>
                    <div className="text-sm text-left pr-2">Next Play in... </div>
                    <Timer isRunning={timerRunning} seconds={TIMER_LENGTH} onFinish={capturePlay}/>
                </div>
                {/* END COUNTDOWN */}

                <div id="npc-view" className="md:w-1/4 aspect-[16/9] bg-sky-300 p-10 "></div>

            </div>
            <div id="buttons" className={`${!gameRunning && "hidden"} flex flex-row gap-10 mt-8 justify-center`}>
            <div className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-500">
                <button>Restart</button>
            </div>
            <div className="px-5 py-2 rounded bg-cyan-500 hover:bg-sky-300">
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