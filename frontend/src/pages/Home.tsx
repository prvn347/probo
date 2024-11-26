import { EventCard } from "@/components/EventCard";
import { isAuthenticated } from "@/store/atom";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

export function Home() {

  return (
    <div className=" ">
      
      <div className=" p-10">
        <h1 className=" text-xl font-bold">All Events</h1>
     <div className=" grid grid-cols-1 sm:grid-cols-3 gap-2">

      <EventCard /> 
      <EventCard /> 
     </div>
      </div>
    </div>
  );
}
