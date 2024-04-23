"use client"
import Timer from "@/components/timer";
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner";
import axios from "axios";
import MenuButton from "@/components/menu-button";
import NpcAnimation from "@/components/npcAnimation";

// shadcn/ui
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


export default function Home() {

    // State Variables // 

    // Camera State
    const [camEnabled, setCamEnabled] = useState(false); 
    
    // Scores
    const [playerScore, setPlayerScore] = useState(0); 
    const [playerMatchScore, setPlayerMatchScore] = useState(0);
    const [numMatchesPlayed, setNumMatchesPlayed] = useState(0);
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
    const [numGames, setNumGames] = useState(5); // default best of 5
    const [currentGameNum, setCurrentGameNum] = useState(1);
    const [timerPulse, setTimerPulse] = useState(false);
    // Canvas for capturing images from webcam
    const hiddenCanvasRef = useRef(null);

    // Countdown length
    const TIMER_LENGTH = 3; 
    // Win message display length
    const WIN_MESSAGE_LENGTH = 4;

    // Configuration Object for UserManager (Webcam access)
    const UMConfig = {
        video: true
    }

    // Global Variables
    let video, hiddenCanvas, context, result; 

    // Run once after first render to find elements
    useEffect(()=>{
        findElements();
        getScoreStorage(); 
        console.log("Found elements");  
    }, []);

    // Control UI for celebrating win/loss
    // Run when playerWonRound or npcWonRound is updated
    useEffect(()=>{
        if (playerWonRound) {
            // Display playerWonRound message for 2 seconds
            setInterval(()=>{
                setPlayerWonRound(false);
            }, WIN_MESSAGE_LENGTH * 1000);
        }
        if (npcWonRound) {
            // Display npcWonRound message for 2 seconds
            setInterval(()=>{
                setNpcWonRound(false);
            }, WIN_MESSAGE_LENGTH * 1000); 
        }
    }, [playerWonRound, npcWonRound]); 

    // Check if game is over when the scores are updated
    useEffect(()=> {
        if (playerScore > numGames/2) {
            // Player wins
            toast.success("You win the match!"); 
            setPlayerMatchScore(playerMatchScore => parseInt(playerMatchScore) + 1);
            stopGame();
        }

        if (npcScore > numGames/2) {
            // NPC wins
            toast.error("Better luck next time!"); 
            stopGame();
        }

        if (currentGameNum >= numGames) {
            // End the match
            stopGame();
        }
    }, [playerScore, npcScore, currentGameNum]);

    useEffect(()=>{
        if (timerPulse) {
            setTimeout(()=>{
                setTimerPulse(false);
            }, 500);
        }
    }, [timerPulse]);
    // Functions // 

    // Find HTML elements
    const findElements = () => {
        video = document.querySelector("#webcam");
        hiddenCanvas = hiddenCanvasRef.current; 
        context = hiddenCanvas.getContext("2d"); 
        result = document.querySelector("#result-photo"); 
    }

    // Update the number of games in a match
    const updateNumGames = (value) => {
        setNumGames(value);
    }
    
    // Start the user's webcam
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

    // Start the game, check camera and setup UI etc
    const startGame = async (skipCheck) => {
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

    const getScoreStorage = () => {
        // Get the playerMatchScore from localstorage
        console.log("Initial Score Values: " + playerMatchScore + " " + numMatchesPlayed)
        if (localStorage.getItem("playerMatchScore") != "null") {
            console.log("Found Score Storage");
            setPlayerMatchScore(localStorage.getItem("playerMatchScore"));
            setNumMatchesPlayed(localStorage.getItem("numMatchesPlayed"));
        } else {
            console.log("Not retreiving storage");
        }
    }

    const updateScoreStorage = () => {
        // Add the playerMatchScore to localstorage whenever it's updated
        console.log("Match Score: " + playerMatchScore + " Num Matches: " + numMatchesPlayed);
        localStorage.setItem("playerMatchScore", playerMatchScore);
        localStorage.setItem("numMatchesPlayed", numMatchesPlayed);
    }

    // Stop the game
    const stopGame = () => {
        setGameRunning(false);
        setPlayerScore(0);
        setNpcScore(0);
        setCurrentGameNum(1);
        setCurrentPlayerMove("");
        setCurrentNpcMove("");
        
        setNumMatchesPlayed(numMatchesPlayed => parseInt(numMatchesPlayed)+1);
        updateScoreStorage();
        console.log("Game Stopped"); 
    }

    // Start the match
    const startMatch = () => {
        // Start the match and run the countdown
        setMatchRunning(true);
        runCountdown();
    }

    const endTurn = () => {
        setGameInProgress(false); 
        setCurrentGameNum(currentGameNum => currentGameNum + 1);
    }

    // Skip to next turn
    const nextTurn = () => {
        // Clear the recent moves
        if (currentPlayerMove || currentNpcMove) {
            setCurrentPlayerMove(""); 
            setCurrentNpcMove(""); 
        }
        // Clear away round win messages
        setNpcWonRound(false); 
        setPlayerWonRound(false);
        // Start the next turn
        runCountdown(); 
    }

    // Start the countdown
    const runCountdown = () => {
        setGameInProgress(true); 
        setTimerRunning(true); 
    }

    // Capture an image from the user's webcam
    const capturePlay = () => {
        findElements(); // ensure that all elements are available
        //setTimerRunning(false);
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

    // Send image to the gesture recognition API wrapper
    const recogniseGesture = async (image) => {

        let result;

        // Re-encode Image from browser base64->binary buffer
        const base64Image = image.split(',')[1]; 
        const imageBuffer = Buffer.from(base64Image, 'base64'); 

        console.log('Sending request');
        console.log(imageBuffer);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/api/recognise',
            headers: { 
                'Content-Type': 'image/png',
            },
            data: imageBuffer
            };
            
        axios.request(config)
        .then((response) => {
            // Send result back
            const gesture = response.data.data;
            console.log("Gesture Found: " + gesture);
            calculateResult(gesture); 
        })
        .catch((error) => {
            // try and format the error message if something went wrong with mediapipe
            try {     
                toast.error("Unable to register your move. No points have been added.", {
                    description: "MediaPipe Error: " + JSON.stringify(error.response.data.data).split("\\n")[3], // split message by newline characters,
                });
            }
            // something else happened, api is probably down
            catch (e) {
                toast.error("Unable to register your move. No points have been added.");
            } 
        });
    }  // ^ ew

    // Get the NPC move and find result
    const calculateResult = async (playerMove) => {
        // use RPS API to find result of game
        console.log("RESULT: " + playerMove);

        let config = {
            method: 'get',
            url: `api/respond?moveID=${playerMove.trim()}`,
            };

        axios.request(config)
        .then((moveResponse)=>{
            const move = moveResponse.data.data.move;
            console.log(move);

            setCurrentPlayerMove(playerMove);
            setCurrentNpcMove(move); 

            if (moveResponse.data.data.type == "loss") {
                setPlayerWonRound(true);
                setPlayerScore(playerScore=>playerScore+1);
            } else {
                setNpcWonRound(true);
                setNpcScore(npcScore=>npcScore+1);
            }
            // Finish turn, allow user to play again
            endTurn();
            })
        .catch((error) => {
            toast.error("Unable to generate AI move. No points have been added.");
        });
    }

    return(
        <div className="">
            <div className="bg-white dark:bg-zinc-800 bg-full text-black dark:text-white pt-12 w-full h-screen px-2">
                <div className={`${gameRunning && "hidden"} flex flex-col mb-5 content-center align-center text-center`}>
                <div className="text-3xl font-semibold">Rock, Paper, Scissors!</div>
                <div className="px-5 mt-2 text-sm dark:text-zinc-300 font-light">Play this classic game against a computer oponent. Use normal hand gestures in-front of the webcam to play!</div>
                </div>
            <div id="scores" className={`${!gameRunning && "hidden"} flex flex-row justify-center mb-8`}>
                <div className="flex flex-col">
                    <div className="px-10 text-xl font-bold">&#128587; {playerScore}/{numGames}</div>
                    <div className="self-center font-light text-md dark:text-zinc-300 pt-2">Move: {currentPlayerMove}</div>
                </div>
                <div className="font-bold text-2xl">Score</div>
                <div className="flex flex-col">
                    <div className="px-10 text-xl font-bold">&#129302; {npcScore}/{numGames}</div>
                    <div className="self-center font-light text-md dark:text-zinc-300 pt-2">Move: {currentNpcMove}</div>
                </div>
            </div>

            <div id="gameplay-menu" className={`${gameRunning && "hidden"} flex flex-col justify-center text-center items-center p-5`}>
                <div className="flex flex-col justify-center items-center pb-5">
                    <div className="pb-5">How many games in a match?</div>
                    <RadioGroup className="mb-5 gap-4" defaultValue={5} onValueChange={updateNumGames}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={3} id="three-games" />
                            <Label htmlFor="three-games">Best of 3</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={5} id="five-games" />
                            <Label htmlFor="five-games">Best of 5</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={7} id="seven-games" />
                            <Label htmlFor="seven-games">Best of 7</Label>
                        </div>
                    </RadioGroup>

                </div>
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

            <div className={`${numMatchesPlayed > 0 ? "" : "hidden"} ${gameRunning && "hidden"}`}>
                <div className="flex flex-row justify-center items-center gap-10 mt-10 text-center">
                    <div className="flex flex-col gap-2">
                        <div className="text-xl font-bold">Games Won</div>
                        <div className="text-3xl">{playerMatchScore}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-xl font-bold">Games Played</div>
                        <div className="text-3xl">{numMatchesPlayed}</div>
                    </div>
                </div>
            </div>

            <div id="gameplay-section" className={`${!gameRunning && "hidden"} flex flex-col sm:flex-row justify-center min-h-48 px-10`}>
                <div id="webcam-container" className=" aspect-[16/9] w-full md:w-3/4 self-center bg-sky-300 flex justify-center items-center overflow-hidden rounded-md">
                    <video id="webcam" autoPlay  playsInline className={`${!camEnabled && "hidden"}`} style={{transform: 'scaleX(-1)', minWidth: '100%', minHeight: '100%'}}></video>
                    {!camEnabled && <button onClick={startCamera} className="px-2 py-2 bg-sky-100 rounded hover:bg-sky-50">Start Camera</button>}
                </div>

                <div className="px-10 py-5 flex flex-row items-center justify-center w-full sm:w-1/3 overflow-hidden">
                {/* START MATCH */}
                <div className={`${matchRunning && "hidden"} w-full`}>
                    <MenuButton action={startMatch}>Go!</MenuButton>
                </div>
                {/* END START MATCH */}

                {/* COUNTDOWN */}
                <div id="countdown" className={`${!matchRunning && "hidden" }`}>
                    <div className="text-sm text-left pr-2">Next Play in... </div>
                    <Timer isRunning={timerRunning} seconds={TIMER_LENGTH} action={capturePlay} setTimerRunning={setTimerRunning} setPulse={setTimerPulse}/>
                </div>
                {/* END COUNTDOWN */}
                </div>

                <div id="npc-view" className="aspect-[16/9] w-full md:w-3/4 self-center bg-sky-300 rounded-md flex justify-center items-center">
                    {/*<div className="text-8xl text-center">{npcMoveSymbol[currentNpcMove] || npcMoveSymbol["rock"]}</div>*/}
                    <NpcAnimation currentNpcMove={currentNpcMove} animate={timerPulse}/>
                </div>

            </div>
            <div id="buttons" className={`${!gameRunning && "hidden"} flex flex-col mt-8 justify-center items-center`}>
            <div className="px-5 py-2 w-3/4 md:w-1/4">
                <MenuButton action={nextTurn}>Next Turn <p className="text-sm inline">({currentGameNum}/{numGames})</p></MenuButton>
            </div>
            <div className="px-5 py-2 w-3/4 md:w-1/4">
                <MenuButton danger action={stopGame}>Quit</MenuButton>
            </div>
            </div>
            <div className={`flex justify-center items-center text-center text-2xl ${playerWonRound && "text-cyan-300"} ${npcWonRound && "text-red-400"}`}>
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