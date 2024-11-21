import { useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Header() {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        {isAuthenticated ? (
          <div className=" flex ">
            <Button>Trade Online</Button>
          </div>
        ) : (
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
        )}
      </div>
    </header>
  );
}
