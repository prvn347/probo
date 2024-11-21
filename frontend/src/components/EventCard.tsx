export const EventCard = () => {
  return (
    <div className="p-4 max-w-md mx-auto border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">
          <i className="mr-1">🇮🇳</i> 8287 traders
        </span>
      </div>
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-green-200 rounded flex items-center justify-center mr-4">
          <img
            src="https://via.placeholder.com/40x40" // Replace with actual image source
            alt="Team Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-gray-800 font-semibold text-lg leading-tight">
            Sydney Thunder Women to win the match vs Melbourne Stars Women?
          </h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        <strong>H2H last 5 T20:</strong> ST-W 2, MS-W 1, DRAW 2{" "}
        <a href="#" className="text-blue-500 hover:underline ml-1">
          Read more
        </a>
      </p>
      <div className="flex justify-between items-center">
        <button className="bg-blue-100 text-blue-500 font-semibold py-2 px-4 rounded-lg flex-1 mr-2 text-center">
          Yes ₹5.5
        </button>
        <button className="bg-red-100 text-red-500 font-semibold py-2 px-4 rounded-lg flex-1 text-center">
          No ₹4.5
        </button>
      </div>
    </div>
  );
};
