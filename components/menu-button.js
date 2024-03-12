export default function MenuButton({children, action}) {
    return(
        <div>
            <button onClick={action} className="p-2 font-semibold text-xl bg-cyan-500 rounded w-full px-20 dark:hover:bg-cyan-800 hover:bg-cyan-300 hover:text-white drop-shadow-sm">{children}</button>
        </div>
    )
}