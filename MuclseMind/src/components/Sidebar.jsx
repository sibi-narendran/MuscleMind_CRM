import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../assets/logo/logo.png';
import { FaTachometerAlt, FaTable, FaArrowLeft } from 'react-icons/fa'; 
import SidebarLinkGroup from './SidebarLinkGroup';
import { Bell, Briefcase, Calendar, Receipt, Users, Stethoscope, BellDot } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const menuItems = [
    { id: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { id: 'patients', icon: Users, label: 'Patients' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'billing', icon: Receipt, label: 'Billing' },
    { id: 'management', icon: Briefcase, label: 'Management' },
    { id: 'reminders', icon: Bell, label: 'Actions' },
    { id: 'prescriptions', icon: BellDot, label: 'Prescriptions' },
  ];

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 ">
        <NavLink to="/" className="flex items-center gap-2 mt-4">
          <Stethoscope className="w-10 h-10 text-white" />
          <span className="text-white">Dental CRM</span>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <FaArrowLeft className="fill-current text-white" />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="py-4 px-4 lg:px-6">
          {/* Menu Group */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">MENU</h3>

            <ul className="mb-6 flex flex-col gap-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarLinkGroup
                    key={item.id}
                    activeCondition={pathname.includes(item.id)}
                  >
                    {() => (
                      <NavLink
                        to={`/${item.id}`}
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          pathname.includes(item.id) && 'bg-graydark dark:bg-meta-4'
                        }`}
                      >
                        <Icon className="text-white" />
                        {item.label}
                      </NavLink>
                    )}
                  </SidebarLinkGroup>
                );
              })}
            </ul>
          </div>
        </nav>
        {/* Sidebar Menu */}
      </div>
    </aside>
  );
};

export default Sidebar;