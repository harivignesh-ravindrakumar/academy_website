import React from "react";
import Sidebar from "./components/Sidebar";
import SummaryBox from "./components/SummaryBox";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-4 gap-6 mb-6">
          <SummaryBox title="Enrolled Students" value="220" progress={65} />
          <SummaryBox title="Courses Offered" value="12" />
          <SummaryBox title="Completed Courses" value="78" />
          <SummaryBox title="Upcoming Events" value="5" />
        </div>
      </div>
    </div>
  );
}

export default App;
