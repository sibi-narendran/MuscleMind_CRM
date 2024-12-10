import React from "react";
import { Typography } from "antd";
import error404 from "../assets/404error.svg";

export function ErrorSection7() {
  return (
      <div className="h-screen mx-auto grid place-items-center text-center px-8">
        <div>
          <img src={error404} alt="404 Error" className="w-80 h-100 mx-auto" />
          <Typography
            variant="h1"
            color="blue-gray"
            className="mt-5 !text-3xl !leading-snug md:!text-4xl"
          >
          <br /> It looks like something went wrong.
          </Typography>
          <Typography className="mt-8 mb-14 text-[18px] font-normal text-gray-500 mx-auto md:max-w-sm">
      Please check your internet connection and try again.
          </Typography>

        </div>
      </div>
  );
}

export default ErrorSection7;