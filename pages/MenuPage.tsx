import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import MenuGrid from '../components/MenuGrid';
import { Loader2 } from 'lucide-react';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Specials', 'Soups', 'Proteins', 'Sides', 'Drinks', 'Swallow'];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Menu</h1>

        {/* Category Buttons */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-orange-600 text-white font-bold' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-orange-600 w-12 h-12" />
          </div>
        ) : (
          <>
            {/* The Grid of Food */}
            {filteredItems.length > 0 ? (
              <MenuGrid items={filteredItems} />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <p className="text-xl">No items found in this category yet.</p>
                <p className="text-sm mt-2">Check back soon!</p>
              </div>
            )}
          </>
        )}
    </div>
  );
}