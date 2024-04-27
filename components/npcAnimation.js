import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function NpcAnimation ({currentNpcMove, animate}) {
    
    // has the animation been triggered
    const [isPulsing, setIsPulsing] = useState(false);
    
    // possible animation content
    const [npcMoveSymbol, setNpcMoveSymbol] = useState({"rock": "👊", "paper": "✋", "scissors": "✌️"}); 

    // Trigger pulse animation when animate changes
    useEffect(() => {
      if (animate) {
        handlePulse();
      }
    }, [animate]);

    const handlePulse = () => {
        // Trigger pulse animation
        setIsPulsing(true);

        // Reset the pulse after a short delay
        setTimeout(() => {
        setIsPulsing(false);
        }, 500);
    };

    return (
        <motion.div
        className="text-8xl text-center"
        animate={isPulsing ? { scale: 1.4 } : { scale: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut"}}
        >
        <p style={{transform: 'rotate(-90deg)'}}>{npcMoveSymbol[currentNpcMove] || npcMoveSymbol["rock"]}</p>
        </motion.div>
    );
};