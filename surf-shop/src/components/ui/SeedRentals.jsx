import {db} from '../../firebase' // Added .js extension
import { collection, doc, writeBatch } from 'firebase/firestore'

const rentalFleet = [
  // --- SHORTBOARDS ---
  {
    name: "Firewire Seaside",
    make: "Firewire",
    category: "Shortboard",
    type: "board",
    image: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?q=80&w=2070&auto=format&fit=crop",
    specs: { length: "5'6\"", vol: "32.5L", fin: "Quad" },
    rates: { daily: 45, member: 25 },
    isDemoQuiver: true,
    stock: 1,
    status: 'active' // active, repair, retired
  },
  {
    name: "Pyzel Phantom",
    make: "Pyzel",
    category: "Shortboard",
    type: "board",
    image: "https://images.unsplash.com/photo-1590503097349-43c2c2f82959?q=80&w=2671&auto=format&fit=crop",
    specs: { length: "6'0\"", vol: "30.5L", fin: "Thruster" },
    rates: { daily: 45, member: 25 },
    isDemoQuiver: true,
    stock: 1,
    status: 'active'
  },

  // --- MIDLENGTHS ---
  {
    name: "Channel Islands Mid",
    make: "Channel Islands",
    category: "Midlength",
    type: "board",
    image: "https://images.unsplash.com/photo-1415604934674-561df9abf539?q=80&w=2560&auto=format&fit=crop",
    specs: { length: "7'2\"", vol: "45L", fin: "2+1" },
    rates: { daily: 45, member: 25 },
    isDemoQuiver: false,
    stock: 2,
    status: 'active'
  },

  // --- LONGBOARDS ---
  {
    name: "Ricky Carroll Log",
    make: "RC Surfboards",
    category: "Longboard",
    type: "board",
    image: "https://images.unsplash.com/photo-1590632863920-80a5e8489f66?q=80&w=2609&auto=format&fit=crop",
    specs: { length: "9'6\"", vol: "N/A", fin: "Single" },
    rates: { daily: 35, member: 15 },
    isDemoQuiver: false,
    stock: 3,
    status: 'active'
  },

  // --- FOAMIES / BEGINNER ---
  {
    name: "Wavestorm Classic",
    make: "Costco",
    category: "Foamie",
    type: "board",
    image: "https://images.unsplash.com/photo-1629827376374-298f98c772e0?q=80&w=2671&auto=format&fit=crop",
    specs: { length: "8'0\"", vol: "86L", fin: "Thruster" },
    rates: { daily: 20, member: 10 },
    isDemoQuiver: false,
    stock: 10,
    status: 'active'
  },

  // --- GEAR ---
  {
    name: "DaFin Swim Fins",
    make: "DaFin",
    category: "Fins",
    type: "gear",
    image: "https://images.unsplash.com/photo-1532009877282-3340270e0529?q=80&w=2670&auto=format&fit=crop",
    specs: { length: "M/L", vol: "-", fin: "-" },
    rates: { daily: 10, member: 0 },
    isDemoQuiver: false,
    stock: 5,
    status: 'active'
  }
]

export default function SeedRentals() {
  const handleSeed = async () => {
    if (!window.confirm("Upload Rental Fleet to Firestore?")) return;

    try {
      console.log("Preparing Rental Fleet...");
      const batch = writeBatch(db);

      rentalFleet.forEach((item) => {
        const docRef = doc(collection(db, "rentals"));
        batch.set(docRef, {
          ...item,
          createdAt: new Date()
        });
      });

      await batch.commit();
      alert(`Success! ${rentalFleet.length} rental items uploaded.`);
    } catch (error) {
      console.error(error);
      alert("Error uploading fleet. Check console.");
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 p-6 bg-blue-900/90 text-white rounded-xl border border-blue-500 shadow-2xl backdrop-blur-md max-w-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
        Fleet Seeder
      </h3>
      <button 
        onClick={handleSeed}
        className="w-full bg-white text-blue-900 font-bold py-2 rounded hover:bg-blue-100 transition-colors cursor-pointer"
      >
        Upload Fleet
      </button>
    </div>
  );
}