"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import men from '../../public/men.svg';
import emailIcon from '../../public/email.svg';
import lock from '../../public/lock.svg';
import { useRouter } from "next/navigation";
import loader from '@/public/Spinner@1x-1.0s-200px-200px.svg';
import { signIn, getProviders } from 'next-auth/react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setloading] = useState(false);
  const router = useRouter();

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password length (at least 6 characters)
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Handle form field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Handle form submission for email/password signup
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate email and password
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(formData.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setloading(true);
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Signup successful!");
        setFormData({
          username: "",
          email: "",
          password: "",
        });
        router.push("/login");
      } else {
        setError(data.error || "Signup failed.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setloading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    // Google sign-in is optional; it only exists when its keys are in .env.
    const providers = await getProviders();
    if (!providers?.google) {
      setError("Google sign-in isn't set up on this server. Use email and password instead.");
      return;
    }
    signIn('google');
  };

  return (
    <>
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-white">
          <Image src={loader} alt="" className="w-52" />
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-white shadow-xl">
          <div className="w-full max-w-sm bg-[#d6d6d6] rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-center text-black mb-4">
              Sign up with email
            </h2>
            <p className="text-sm text-center text-black mb-6">
              Make a new doc to bring your word, data, and teams together. For free
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-2 relative">
                <Image
                  src={men}
                  alt="user icon"
                  className="absolute top-1/2 w-4 left-4 transform -translate-y-1/2 -translate-x-1/2"
                />
                <input
                  type="text"
                  id="username"
                  placeholder="Name"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-6 pl-8 py-1 bg-white text-[#2B2D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-2 relative">
                <Image
                  src={emailIcon}
                  alt="email icon"
                  className="absolute top-1/2 w-4 left-4 transform -translate-y-1/2 -translate-x-1/2"
                />
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 pl-8 py-1 bg-white text-[#2B2D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-2 relative">
                <Image
                  src={lock}
                  alt="lock icon"
                  className="absolute top-1/2 w-4 left-4 transform -translate-y-1/2 -translate-x-1/2"
                />
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 pl-8 py-1 bg-white text-[#2B2D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F8EF6D] text-black font-bold py-2 rounded-md hover:bg-yellow-400 transition duration-300"
              >
                Sign up
              </button>
            </form>

            <div className="flex items-center justify-center my-4">
              <div className="h-px bg-gray-600 w-full"></div>
              <p className="text-sm text-black mx-4">Or&nbsp;Sign&nbsp;Up&nbsp;with</p>
              <div className="h-px bg-gray-600 w-full"></div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="bg-gray-200 shadow-xl h-fit py-2 px-6 rounded-md border-white transition duration-300"
              >
                <FcGoogle className="w-4 h-4" />
              </button>

              <button className="bg-gray-200 shadow-xl h-fit py-2 px-6 rounded-md border-white transition duration-300">
                <FaFacebookF className="w-4 h-4 text-blue-600" />
              </button>

              <button className="bg-gray-200 shadow-xl h-fit py-2 px-6 rounded-md border-white transition duration-300">
                <FaApple className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
