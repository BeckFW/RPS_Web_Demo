

export default function Home() {

    return(
        <div>
            <div className="bg-white bg-full text-black mt-32">
            <div id="scores" className="flex flex-row justify-center gap-24 mb-8">
                <div className="px-10">/5</div>
                <div>Score</div>
                <div className="px-10">/5</div>
            </div>
            <div id="gameplay-section" className="flex flex-row justify-center">
                <div id="camera-view" className="w-1/4 bg-sky-300 py-20 px-10"></div>
                <div id="countdown" className="px-10 flex flex-col justify-center">
                    <div className="text-md py-1">Next Play in...</div>
                    <div className="font-bold text-center text-xl">3</div>
                </div>
                <div id="npc-view" className="w-1/4 bg-sky-300 p-10"></div>
            </div>
            <div id="buttons" className="flex flex-row gap-10 mt-8 justify-center">
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button>Restart</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-50 hover:bg-sky-300">
                <button>Save Score</button>
            </div>
            <div className="px-5 py-2 rounded bg-sky-200 hover:bg-sky-300">
                <button>Next Turn</button>
            </div>
            </div>
            </div>
        </div>
    )
}