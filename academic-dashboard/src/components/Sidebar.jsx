import React from "react";

export default function Sidebar(){
    return(
        <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
             <h2 className="text-2xl font-bold p-4">SOWTHAS Academy</h2>
             <nav className="flex flex-col gap-4 p-4">
                <a href="#" className="hover:text-pink-400">Dashboard</a>
                <a href="#" className="hover:text-pink-400">Students</a>
                <a href="#" className="hover:text-pink-400">Courses</a>
                <a href="#" className="hover:text-pink-400">Events</a>
                <a href="#" className="hover:text-pink-400">Success Stories</a>
             </nav>
        </div>
    )
}