import { Button } from "./ui/button";

export const EventCard = () => {
  return <div className=" rounded-md  p-8  bg-white font-worksans">

    <div className=" flex gap-2 pb-5">

      <img className=" w-20 h-20" src="https://probo.in/_next/image?url=https%3A%2F%2Fprobo.gumlet.io%2Fimage%2Fupload%2Fprobo_product_images%2FIMAGE_207fe0ff-6e8a-474a-a762-08ebbf2e36b8.png&w=96&q=75" alt="" />
      <h1 className="text-md  text-black">Bitcoin to be priced at something</h1>
      
    </div>
    <div>
    <span className="text-xs text-black ">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam, praesentium!</span> 
    </div>
    <div className=" flex gap-2">
      
      <Button className=" bg-blue-400  w-full text-blue-800">Yes</Button>
      <Button className=" bg-red-300  w-full  text-red-600">No</Button>
    </div>

    
    
  </div>;
};
