import React from "react";
import DashboardComponent from "../components/Dashboard";

const DashboardPage = () => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-10">
        <DashboardComponent />
      </div>
    </React.Fragment>
  );
};

export default DashboardPage;
