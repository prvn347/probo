import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="h-full w-full flex justify-between items-center px-10 py-2">
      <div className="flex flex-col justify-center text-start">
        <h1 className="text-5xl my-7">Invest in your point of view</h1>
        <h2 className="text-4xl my-9">point of view</h2>
        <div className="flex gap-5">
          <Button className="bg-white text-black">Download App</Button>
          <Button
            onClick={() => {
              navigate("/login");
            }}
          >
            Trade Online
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center w-full max-w-3xl">
        <img
          className="w-full h-auto object-contain"
          src="https://probo.in/_next/image?url=https%3A%2F%2Fd39axbyagw7ipf.cloudfront.net%2Fimages%2Fhome%2Fheader%2Fheader.webp&w=640&q=75"
          alt="Header"
        />
      </div>
    </section>
  );
};
