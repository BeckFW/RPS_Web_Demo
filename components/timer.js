import { useEffect, useState, useRef } from "react";

export default function Timer({isRunning, seconds, action, setTimerRunning, setPulse}) {

    const [countdown, setCountdown] = useState(seconds); 
    const timerID = useRef(); 
    
    const reset = () => {
        setTimerRunning(false);
        setCountdown(seconds); 
    }

    useEffect(()=> {
        if (isRunning) {
            setPulse(true);
            timerID.current = setInterval(()=>{
                // update timer
                setCountdown(secs => secs - 1); 
                setPulse(true);
            }, 1000); 
        } else {
            clearInterval(timerID.current); 
        }

        // Clean up timer
        return () => clearInterval(timerID.current);
    }, [isRunning])

    useEffect(()=> {
        if (countdown == 1 ) {
            action();
        }
        else if (countdown == 0) {
            clearInterval(timerID.current); 
            reset(); 
        }
    }, [countdown])

    return ( 
        <div className="font-bold text-center text-2xl">{countdown}</div>
    )
}