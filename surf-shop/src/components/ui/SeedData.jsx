import { db } from '../../firebase'; 
import { collection, addDoc, writeBatch, doc } from "firebase/firestore";

const productsToSeed = [
  // --- MEN'S APPAREL ---
  { 
    name: 'Bird Rock Logo Tee', 
    slug: 'bird-rock-logo-tee-men',
    category: 'Men', 
    subCategory: 'Apparel',
    type: 'apparel', 
    price: 32, 
    memberPrice: 28, 
    badge: 'New Drop', 
    icon: 'ph-t-shirt', 
    stock: 50,
    isActive: true,
    description: "The classic shop tee. 100% organic cotton, printed locally in San Diego.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"
  },
  { 
    name: 'Dawn Patrol Hoodie', 
    slug: 'dawn-patrol-hoodie-men',
    category: 'Men', 
    subCategory: 'Apparel',
    type: 'apparel', 
    price: 65, 
    memberPrice: 55, 
    badge: 'Best Seller', 
    icon: 'ph-hoodie', 
    stock: 30,
    isActive: true,
    description: "Heavyweight fleece for those early morning checks at the Shores.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop"
  },

  // --- WOMEN'S APPAREL ---
  { 
    name: 'Sunset Crop Tee', 
    slug: 'sunset-crop-tee-women',
    category: 'Women', 
    subCategory: 'Apparel',
    type: 'apparel', 
    price: 28, 
    memberPrice: 24, 
    badge: null, 
    icon: 'ph-t-shirt', 
    stock: 45,
    isActive: true,
    description: "Lightweight and boxy fit. Perfect for post-surf tacos.",
    image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1974&auto=format&fit=crop"
  },

  // --- SURFBOARDS (Note the specs field) ---
  { 
    name: 'Pyzel Crisis', 
    slug: 'pyzel-crisis-5-10',
    category: 'Surfboards', 
    subCategory: 'Shortboard',
    type: 'board', 
    price: 850, 
    memberPrice: null, 
    specs: { length: "5'10\"", vol: '29.5L', fin: 'Twin', width: "19 1/4\"" }, 
    badge: 'Free Rental Demo', 
    icon: 'ph-wave-sine',
    stock: 2,
    isActive: true,
    description: "A high-performance twin fin that bridges the gap between fun and shredding.",
    image: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: 'CJ Nelson Sprout', 
    slug: 'cj-nelson-sprout-9-2',
    category: 'Surfboards', 
    subCategory: 'Longboard',
    type: 'board', 
    price: 1100, 
    memberPrice: null, 
    specs: { length: "9'2\"", fin: 'Single', style: 'Log', vol: "N/A" }, 
    badge: 'Staff Pick', 
    icon: 'ph-wave-sine',
    stock: 1,
    isActive: true,
    description: "The ultimate noserider. Locked in and stable for days.",
    image: "https://images.unsplash.com/photo-1590632863920-80a5e8489f66?q=80&w=2609&auto=format&fit=crop"
  },

  // --- ACCESSORIES ---
  { 
    name: 'Sticky Bumps Wax', 
    slug: 'sticky-bumps-cool',
    category: 'Accessories', 
    subCategory: 'Wax',
    type: 'accessory', 
    price: 4, 
    memberPrice: null, 
    badge: null, 
    icon: 'ph-drop', 
    stock: 200,
    isActive: true,
    description: "Cool water formula (58F - 68F).",
    image: "https://images.unsplash.com/photo-1622396636133-74323d7788fa?q=80&w=2000&auto=format&fit=crop"
  },
  { 
    name: 'Sea Salt Candle', 
    slug: 'sea-salt-candle',
    category: 'Home', 
    subCategory: 'Decor',
    type: 'accessory', 
    price: 28, 
    memberPrice: null, 
    badge: null, 
    icon: 'ph-fire', 
    stock: 15,
    isActive: true,
    description: "Smells like a foggy morning at Windansea.",
    image: "https://images.unsplash.com/photo-1602825420377-50a3c200676a?q=80&w=2000&auto=format&fit=crop"
  }
];

export default function SeedData() {
  
 const handleSeed = async () => {
    // 1. Confirm action
    if (!window.confirm("This will upload products to your Firebase 'products' collection. Continue?")) return;

    try {
      console.log("Starting batch upload...");
      const batch = writeBatch(db); // Use batch for atomic writes (all or nothing)

      productsToSeed.forEach((product) => {
        // Create a reference with a new auto-ID
        const docRef = doc(collection(db, "products"));
        batch.set(docRef, {
          ...product,
          createdAt: new Date()
        });
      });

      console.log("Batch prepared. Attempting to commit to Firestore...");

      // 2. TIMEOUT PROTECTION
      // If the browser blocks the network, batch.commit() hangs forever.
      // We race it against a 15-second timer to give you feedback.
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network Timeout: Browser blocked the connection. Check AdBlockers!")), 15000)
      );

      // Race: Upload vs Timeout
      await Promise.race([batch.commit(), timeout]);
      
      alert(`Success! ${productsToSeed.length} products uploaded to Firestore.`);
      console.log("Seeding complete.");

    } catch (error) {
      console.error("Error seeding database:", error);
      alert(`Seeding Failed: ${error.message}\n\nPlease disable AdBlockers/Brave Shields and try again.`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 p-6 bg-red-900/90 text-white rounded-xl border border-red-500 shadow-2xl backdrop-blur-md max-w-sm">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
        Admin Seeder
      </h3>
      <p className="text-xs text-red-200 mb-4">
        Click below to populate your Firestore "products" collection with {productsToSeed.length} dummy items using Unsplash images.
      </p>
      <button 
        onClick={handleSeed}
        className="w-full bg-white text-red-900 font-bold py-2 rounded hover:bg-red-100 transition-colors"
      >
        Run Seeding Script
      </button>
    </div>
  );
}