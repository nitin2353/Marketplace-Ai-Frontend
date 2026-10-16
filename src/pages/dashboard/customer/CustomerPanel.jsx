import Requirement from "./Requirement";
import Orders from "./Orders";

export default function CustomerPanel() {
    return (
        <div className="space-y-6">

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <h2 className="text-lg font-bold mb-2">Create Requirement</h2>
                <Requirement />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <h2 className="text-lg font-bold mb-2">Your Orders</h2>
                <Orders />
            </div>

        </div>
    );
}