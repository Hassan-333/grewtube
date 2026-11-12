"use client";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import emailIcon from '../../public/email.svg';
import lock from '../../public/lock.svg';
import Link from "next/link";
import loader from '@/public/Spinner@1x-1.0s-200px-200px.svg'
import { signIn, getSession } from "next-auth/react"; 





const LoginSignup = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Reset error state
    setLoading(true); // Start loading spinner

    // Sign in using credentials with NextAuth
    const result = await signIn("credentials", {
      redirect: false, // Handle redirects manually
      email: formData.email,
      password: formData.password,
    });

    if (result?.error) {
      // If error occurs during login, set error message
      setError(result.error);
      setLoading(false); // Stop loading on error
    } else {
      // Fetch the session to check user role after login
      const session = await getSession();

      // If session exists and user is an admin, redirect to admin panel
      if (session && session.user.role === "admin") {
        router.push("/admin"); // Redirect to admin dashboard
      } else {
        router.push("/dashboard"); // Redirect to homepage for regular users
      }
      setLoading(false); // Stop loading after redirection
    }
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
          Sign in with email
        </h2>
        <p className="text-sm text-center text-black mb-6">
          Make a new doc to bring your word, data, and teams together. For free
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-2 relative">
            <Image src={emailIcon} alt="Email" className="absolute top-1/2 w-4 left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 pl-8 py-1 bg-white text-[#2B2D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-2 relative">
            <Image src={lock} alt="Password" className="absolute top-1/2 w-4 left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-6 pl-8 py-1 bg-white text-[#2B2D32] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
          <button type="submit" className="w-full bg-[#F8EF6D] text-black font-bold py-2 rounded-md hover:bg-yellow-400 transition duration-300">
            Sign in
          </button>
        </form>
        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-600 w-full"></div>
         <p className="text-sm text-black mx-4">Don&apos;t&nbsp;have&nbsp;an&nbsp;account?</p>
          <div className="h-px bg-gray-600 w-full"></div>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/signup" className="text-sm text-blue-400 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
)}
    
              </>
  );
};

export default LoginSignup;
