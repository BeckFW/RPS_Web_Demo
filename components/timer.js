import { useEffect, useState, useRef } from "react";

export default function Timer({isRunning, seconds, onFinish}) {

    const [countdown, setCountdown] = useState(seconds); 
    const timerID = useRef(); 
    
    const reset = () => {
        setCountdown(seconds); 
    }

    useEffect(()=> {
        if (isRunning) {
            timerID.current = setInterval(()=>{
                // update timer
                setCountdown(secs => secs - 1); 
            }, 1000); 
        } else {
            clearInterval(timerID.current); 
        }

        // Clean up timer
        return () => clearInterval(timerID.current);
    }, [isRunning])

    useEffect(()=> {
        if (countdown == 0) {
            clearInterval(timerID); 
            onFinish(); 
            reset(); 
        }
    }, [countdown])

    return ( 
        <div className="font-bold text-center text-xl">{countdown}</div>
    )
}