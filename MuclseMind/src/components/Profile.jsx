import Breadcrumb from '../components/Breadcrumb';
import CoverOne from "../Images/cover-01.jpg";
import userSix from '../Images/user-06.png';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, FaEdit } from 'react-icons/fa';
import { MdCameraAlt } from 'react-icons/md';
import { getUserProfile } from '../api.services/services';
import { useEffect, useState } from 'react';


const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userProfile = await getUserProfile();
      setUser(userProfile.data);
    };

    fetchUserProfile();
  }, []);

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
          {/* <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded bg-primary py-1 px-2 text-sm font-medium text-white hover:bg-opacity-90 xsm:px-4"
            >
              <input type="file" name="cover" id="cover" className="sr-only" />
              <FaEdit />
              <span>Edit</span>
            </label>
          </div> */}
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              <img src={userSix} alt="profile" />
              {/* <label
                htmlFor="profile"
                className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <MdCameraAlt />
                <input
                  type="file"
                  name="profile"
                  id="profile"
                  className="sr-only"
                />
              </label> */}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
            {user?.username}
            </h3>
            <p className="font-medium">{user?.clinicName}</p>
            <p className="font-medium">{user?.email}</p>
            <p className="font-medium">{user?.phoneNumber}</p>


            <div className="mx-auto max-w-180 mt-6">
              <h4 className="font-semibold text-black dark:text-white">
                About Me
              </h4>
              <p className="mt-4.5 font-thin">
              A Dental Doctor CRM (Customer Relationship Management) system is a specialized tool designed to streamline patient management for dental practices. It centralizes patient records, appointments, treatment plans, and communication for seamless workflow and improved patient experience. Features often include automated reminders, billing integration, and analytics for practice growth. It enhances patient retention through personalized follow-ups and efficient handling of queries. The system is customizable to cater to the specific needs of individual dental clinics.
              </p>
            </div>

            <div className="mt-6.5">
              <h4 className="mb-3.5 font-medium text-black dark:text-white">
                Follow me on
              </h4>
              <div className="flex items-center justify-center gap-3.5">
                <Link to="#" className="hover:text-primary" aria-label="Facebook">
                  <FaFacebookF className="text-current" />
                </Link>
                <Link to="#" className="hover:text-primary" aria-label="Twitter">
                  <FaTwitter className="text-current" />
                </Link>
                <Link to="#" className="hover:text-primary" aria-label="Instagram">
                  <FaInstagram className="text-current" />
                </Link>
                <Link to="#" className="hover:text-primary" aria-label="LinkedIn">
                  <FaLinkedinIn className="text-current" />
                </Link>
                <Link to="#" className="hover:text-primary" aria-label="GitHub">
                  <FaGithub className="text-current" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
