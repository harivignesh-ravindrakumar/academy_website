import React from "react";

export default function SummaryBox({ title, value, progress }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold text-pink-600">{value}</p>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-pink-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
