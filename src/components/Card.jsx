export default function Card({ children }) {
    return (
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white 
                        rounded-2xl shadow-md p-4 hover:shadow-xl transition">
            {children}
        </div>
    );
}