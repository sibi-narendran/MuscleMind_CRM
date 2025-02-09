import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Select } from "antd";
import { userRegister, otpVerify, sendOtp } from "../interceptor/services";
import cover from '../assets/background.jpg'

const { Option } = Select;

const CreateAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('dr');

  const initialValues = {
    username: "",
    email: "",
    phoneNumber: "",
    clinicName: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    clinicName: Yup.string().required("Clinic name is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleEmailVerification = async (email) => {
    if (!email) {
      message.error("Please enter your email address.");
      return;
    }

    setOtpLoading(true);

    try {
      await sendOtp({ email });
      setOtpSent(true);
      message.success("OTP sent to your email.");
    } catch (err) {
      message.error("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus on next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpVerification = async (email) => {
    const otpValue = otp.join("");
    try {
      const response = await otpVerify({ otp: otpValue, email }); // Use otpVerify service
      if (response.success) {
        setIsEmailVerified(true);
        message.success("OTP verified successfully.");
      } else {
        message.error(response.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    if (!isEmailVerified) {
      message.error("Please verify your email before creating an account.");
      setLoading(false);
      return;
    }

    try {
      const response = await userRegister({
        username: `${selectedTitle.toUpperCase()}. ${values.username}`,
        email: values.email,
        clinicName: values.clinicName,
        phoneNumber: values.phoneNumber,
        password: values.password,
        otp: otp.join(""),
      });

      if (response.status === 201) {
        message.success("Account created successfully.");
        navigate("/");
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative w-full h-screen flex items-center"
      style={{
        backgroundImage: `url(${cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-opacity-90 backdrop-blur-md rounded-2xl shadow-xl ml-auto mr-8 sm:mr-16 lg:mr-24">
        <h2 className="text-2xl font-bold text-center text-white">
          Create Account
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2 flex">
                  <Select
                    value={selectedTitle}
                    className="w-20"
                    onChange={(value) => setSelectedTitle(value)}
                  >
                    <Option value="mr">Mr</Option>
                    <Option value="mrs">Mrs</Option>
                    <Option value="dr">Dr</Option>
                  </Select>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className="flex-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-meta-1 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2 flex">
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="flex-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleEmailVerification(values.email)}
                    className="ml-2 px-4 py-1.5 text-white bg-meta-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-meta-5 focus:ring-offset-2 transition duration-150"
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Sending..." : "Verify"}
                  </button>
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-meta-1 text-sm"
                />
              </div>
              {otpSent && (
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Enter OTP
                  </label>
                  <div className="mt-2 flex space-x-2">
                    {otp.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        className="w-10 h-10 text-center rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOtpVerification(values.email)}
                    className="mt-2 px-4 py-1.5 text-white bg-meta-3 rounded-md hover:bg-meta-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              <div>
                <label
                  htmlFor="clinicName"
                  className="block text-sm font-medium text-gray-900"
                >
                  Clinic Name
                </label>
                <div className="mt-2">
                  <Field
                    type="text"
                    id="clinicName"
                    name="clinicName"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <ErrorMessage
                    name="clinicName"
                    component="div"
                    className="text-meta-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-900"
                >
                  Phone Number
                </label>
                <div className="mt-2">
                  <Field
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-meta-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-meta-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-900"
                >
                  Confirm Password
                </label>
                <div className="mt-2">
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-meta-1 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-meta-5 rounded-md hover:bg-meta-4 focus:outline-none focus:ring-2 focus:ring-meta-5 focus:ring-offset-2 transition duration-150"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateAccount;
