"use client"
import Timer from "@/components/timer";
import { useEffect, useState } from "react"


export default function Home() {

    const [camEnabled, setCamEnabled] = useState(false); 
    const [playerScore, setPlayerScore] = useState(0); 
    const [npcScore, setNpcScore] = useState(0); 
    const [gameRunning, setGameRunning] = useState(false); 
    const [timerRunning, setTimerRunning] = useState(false); 

    const TIMER_LENGTH = 3; 

    const userManagerConfig = {
        video: true
    }
    let video; 

    useEffect(()=>{
        findElements();
    }, []);

    const findElements = () => { 
        video = document.querySelector("#webcam");
    }
    
    const startCamera = () => {
        if (!camEnabled) {
            setCamEnabled(true); 
            video = document.querySelector('#webcam')
            // Activate the webcam stream.
            navigator.mediaDevices.getUserMedia(userManagerConfig).then(function (stream) {
            video.srcObject = stream;
            })
        }
    }

    const startGame = () => {
        if (camEnabled) {
            setGameRunning(true); 
            console.log("Game Running"); 

            runCountdown()


        } else {
            alert("Please enable your camera to start the game.");
        }
        
    }

    const stopGame = () => {
        setGameRunning(false);
        console.log("Game Stopped"); 
    }

    const runCountdown = () => {
        setTimerRunning(true); 
    }

    const capturePlay = () => {
        setTimerRunning(false); 
        alert("Turn captured!"); 
    }

    const calculateResult = () => {

    }
    

    return(
        <div>
            <div className="bg-white bg-full text-black mt-32 w-full px-2">
            <div id="scores" className="flex flex-row justify-center gap-24 mb-8">
                <div className="px-10">{playerScore}/5</div>
                <div>Score</div>
                <div className="px-10">{npcScore}/5</div>
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
                <div id="npc-view" className="w-1/4 min-w-32 bg-sky-300 p-10"></div>
            </div>
            <div id="buttons" className="flex flex-row gap-10 mt-8 justify-center">
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button>Restart</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-50 hover:bg-sky-300">
                <button onClick={gameRunning ? stopGame : startGame}>{gameRunning ? "Stop" : "Start"}</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button>Next Turn</button>
            </div>
            </div>
            </div>
        </div>
    )
}