/* each card in the grid is an independent component*/

import Women from "../../components/ui/WomenCard";
import Hero from "../../components/ui/Hero";
import Boards from "../../components/ui/BoardsCard";
import Society from "../../components/ui/SocietyCard";
import Men from "../../components/ui/MenCard";
import Rentals from "../../components/ui/RentalsCard";
import Story from "../../components/ui/StoryCard";
import SurfShack from "../../components/ui/SurfShackCard";
import Groms from "../../components/ui/Groms";
import Accessories from "../../components/ui/AccessoriesCard";
import Newsletter from "../../components/ui/Newsletter";

export default function Home() {
    return (
      <>
      {/* Main Grid Layout */}
        <div className="bento-grid grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4">
  
          {/* 1. Hero Module */}
            <Hero />
          

            {/* 7. Boards */}
            <Boards />
         
  
          {/* 2. The Surf Society */}
            <Society />
         
  
          {/* 3. Women's */}
            <Women />
   
          {/* 4. Men's */}
            <Men />
        
  
          {/* 5. Rentals */}
            <Rentals />
          
  
          {/* 6. Story */}
            <Story />
       
  
        
  
          {/* 7.5 Surfshack */}
            <SurfShack />
  
          {/* 8. Groms */}
            <Groms />
        
  
          {/* 9. Accessories */}
            <Accessories />
          
  
        </div>
  
        {/* Newsletter Section */}
        <Newsletter />
       
      </>
    );
  }