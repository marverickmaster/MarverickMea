import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, LogOut, Loader2, Link as LinkIcon } from 'lucide-react';

const CATEGORIES = ['Specials', 'Soups', 'Proteins', 'Sides', 'Drinks', 'Swallow'];

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // New Item Form
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Specials',
    imageUrl: '' // We will paste a link here now
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) fetchItems();
    });
    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Failed to login. Check your email/password.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use the link the user pasted, or a default if empty
      const finalImage = newItem.imageUrl.trim() || "https://placehold.co/400x300?text=No+Image";

      await addDoc(collection(db, "menu"), {
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description,
        category: newItem.category,
        imageUrl: finalImage,
        isAvailable: true,
        createdAt: new Date()
      });

      setNewItem({ name: '', price: '', description: '', category: 'Specials', imageUrl: '' });
      alert("Item added successfully!");
      fetchItems(); 
    } catch (err) {
      console.error(err);
      alert("Error adding item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "menu", id));
      fetchItems();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={() => signOut(auth)} className="text-red-600 flex items-center"><LogOut size={20} className="mr-2"/> Logout</button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-orange-600"/> Add New Meal</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Name (e.g., Jollof Rice)" className="p-3 border rounded-lg w-full" 
                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <input required type="number" placeholder="Price (e.g., 2500)" className="p-3 border rounded-lg w-full" 
                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
            </div>
            
            <textarea required placeholder="Description" className="p-3 border rounded-lg w-full" rows={2}
              value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="p-3 border rounded-lg w-full" 
                value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              {/* IMAGE LINK INPUT */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="url" 
                  placeholder="Paste Image Link (https://...)" 
                  className="pl-10 p-3 border rounded-lg w-full"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})}
                />
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full bg-black text-white py-3 rounded-lg font-bold">
              {isSubmitting ? <Loader2 className="animate-spin"/> : "Add Item"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Current Menu</h2>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-orange-600 font-bold">₦{item.price}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}