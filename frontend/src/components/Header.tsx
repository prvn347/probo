import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticated } from "@/store/atom";
import { getINRBalance } from "@/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Wallet } from "lucide-react";

export function Header() {
  const isAuthenticatedValue = useRecoilValue(isAuthenticated);
  const [inr, setInr] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inr = await getINRBalance();
        console.log(inr.balance); 
        setInr(inr.balance)// Handle your balance data
      } catch (error) {
        console.error("Error fetching INR balance:", error);
      }
    };

    fetchData(); // Call the async function
  }, [])

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-10">
        {isAuthenticatedValue ? (
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
             
              <span className="font-medium border-2 px-5 py-1 flex gap-2 items-center rounded-md "> <Wallet size={20}/> ₹{inr}</span>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    {" "}
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSeparator />
           
                    <DropdownMenuItem onClick={()=>{
                       localStorage.removeItem("token")
                       navigate('/')
                    }} className=" font-bold">Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link className="font-bold text-xl " to={""}>
              probo.
            </Link>
            <div className=" flex ">
              <Button
                onClick={() => {
                  navigate("/login");
                }}
              >
                Trade Online
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
