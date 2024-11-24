import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticated } from "@/store/atom";
import { getINRBalance } from "@/api";

export function Header() {
  const isAuthenticatedValue = useRecoilValue(isAuthenticated)
  const navigate = useNavigate()
  useEffect(()=>{
    await getINRBalance()
  })
 

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-10">
        {isAuthenticatedValue ?
        
          <>
            <div className="flex items-center gap-8">
              <Link className="font-bold text-xl" to={""}>
                probo.
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link className="text-sm font-medium" to={""}>
                  Home
                </Link>
                <Link className="text-sm font-medium" to={""}>
                  Portfolio
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                For 18 years and above only
              </span>
              <Button>Download App</Button>
              <span className="font-medium">₹12.6</span>
            </div>
          </>
         : (
          <><Link className="font-bold text-xl " to={""}>
          probo.
        </Link><div className=" flex ">
            <Button onClick={()=>{
              navigate("/login")
            }}>Trade Online</Button>
          </div></>
        )}
      </div>
    </header>
  );
}
