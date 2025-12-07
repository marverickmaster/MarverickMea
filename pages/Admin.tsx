import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase'; // Connects to the file you just made
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, LogOut, Loader2, Image as ImageIcon } from 'lucide-react';

// Categories for your menu
const CATEGORIES = ['Specials', 'Soups', 'Proteins', 'Sides', 'Drinks', 'Swallow'];

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // New Item Form States
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Specials'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) fetchItems();
    });
    return () => unsubscribe();
  }, []);

  // Fetch items from Database
  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "menu"));
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenuItems(items);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Failed to login. Check your email/password.');
    }
  };

  // Handle Adding New Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload Image to Storage
      const imageRef = ref(storage, `food-images/${imageFile.name + Date.now()}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      // 2. Save Item to Database (Firestore)
      await addDoc(collection(db, "menu"), {
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description,
        category: newItem.category,
        imageUrl: imageUrl, // The real cloud link
        isAvailable: true,
        createdAt: new Date()
      });

      // 3. Reset Form
      setNewItem({ name: '', price: '', description: '', category: 'Specials' });
      setImageFile(null);
      alert("Item added successfully!");
      fetchItems(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Error adding item. Try again.");
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

  // --- RENDER: LOGIN SCREEN ---
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={() => signOut(auth)} className="flex items-center text-red-600 hover:text-red-700 font-medium">
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </div>

        {/* ADD ITEM FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-orange-600"/> Add New Meal</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Food Name (e.g., Jollof Rice)" className="p-3 border rounded-lg w-full" 
                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <input required type="number" placeholder="Price (e.g., 2500)" className="p-3 border rounded-lg w-full" 
                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
            </div>
            
            <textarea required placeholder="Description (e.g., Served with plantain and beef)" className="p-3 border rounded-lg w-full" rows={2}
              value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="p-3 border rounded-lg w-full" 
                value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              {/* IMAGE UPLOAD INPUT */}
              <div className="relative border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <input required type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                <div className="flex items-center text-gray-500">
                  <ImageIcon size={20} className="mr-2" />
                  {imageFile ? <span className="text-orange-600 font-medium truncate">{imageFile.name}</span> : "Tap to upload image"}
                </div>
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex justify-center items-center">
              {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : "Add Item to Menu"}
            </button>
          </form>
        </div>

        {/* MENU LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Current Menu Items</h2>
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-orange-600 font-bold">₦{item.price}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {menuItems.length === 0 && <p className="text-center text-gray-500 py-4">No items yet. Add one above!</p>}
        </div>
      </div>
    </div>
  );
}