import { db } from '../../firebase.js' // Added .js extension
import { doc, setDoc } from 'firebase/firestore'

// Exact data from your current SurfShack.jsx
const propertyData = {
    name: "The Bird Rock Bungalow",
    tagline: "Sleep where you surf.",
    description: "A hidden industrial-modern loft tucked behind the shop. 50 steps to the reef. Wake up, check the cam, grab a board from the demo quiver, and paddle out before the coffee brews. Equipped with an outdoor shower, high-speed fiber for remote work, and secure board storage.",
    price: 350,
    maxGuests: 4,
    images: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop", // Main
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1587&auto=format&fit=crop", // Interior
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop", // Patio
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"  // Beach
    ],
    amenities: [
        { icon: "ph-wifi-high", label: "Fiber Wifi" },
        { icon: "ph-shower", label: "Outdoor Shower" },
        { icon: "ph-surfboard", label: "Board Rack" },
        { icon: "ph-coffee", label: "Espresso Bar" },
        { icon: "ph-speaker-hifi", label: "Sonos System" },
        { icon: "ph-car", label: "Private Parking" }
    ]
}

export default function SeedProperty() {
  const handleSeed = async () => {
    if (!window.confirm("Overwrite 'Main Shack' data in Firestore?")) return;

    try {
      console.log("Uploading Property Data...");
      
      // We use a specific ID "main_shack" so it's easy to find later
      const docRef = doc(db, "properties", "main_shack");
      
      await setDoc(docRef, {
          ...propertyData,
          updatedAt: new Date()
      });

      alert("Success! Property data uploaded to 'properties/main_shack'.");
    } catch (error) {
      console.error(error);
      alert("Error uploading property. Check console.");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 p-6 bg-purple-900/90 text-white rounded-xl border border-purple-500 shadow-2xl backdrop-blur-md max-w-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></span>
        Property Seeder
      </h3>
      <button 
        onClick={handleSeed}
        className="w-full bg-white text-purple-900 font-bold py-2 rounded hover:bg-purple-100 transition-colors cursor-pointer"
      >
        Upload Bungalow Data
      </button>
    </div>
  );
}