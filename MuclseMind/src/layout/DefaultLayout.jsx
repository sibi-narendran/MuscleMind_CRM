import { useState } from 'react';
import Header from '../comman/Header';
import Sidebar from '../comman/Sidebar';
import ChatBot from '../comman/ChatBot';
import { Outlet } from 'react-router-dom';

const DefaultLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-boxdark-2 dark:text-bodydark">
       <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <Outlet />
            </div>
          </main>
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
