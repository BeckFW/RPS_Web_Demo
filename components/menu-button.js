export default function MenuButton({children, action, danger}) {
    return(
        <div>
            <button onClick={action} className={`${danger ? "bg-cyan-700 hover:bg-cyan-600 hover:text-white" : ""} py-3 font-semibold text-xl bg-cyan-500 rounded w-full px-10 dark:hover:bg-cyan-800 dark:hover:text-cyan-300 hover:bg-cyan-300 hover:text-cyan-800 text-white drop-shadow-sm`}>{children}</button>
        </div>
    )
}