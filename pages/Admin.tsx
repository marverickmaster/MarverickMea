import React, { useState } from 'react';
import { MOCK_MENU, formatCurrency } from '../services/data';
import { ADMIN_CREDENTIALS, MenuItem } from '../types';
import { Plus, Edit, Trash, Upload, X } from 'lucide-react';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<MenuItem[]>(MOCK_MENU);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Login Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-brand-orange"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-brand-orange"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-700">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">Image</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100"/>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isAvailable ? 'Active' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-gray-400">
                        <button className="hover:text-blue-600"><Edit size={18} /></button>
                        <button className="hover:text-red-600"><Trash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal Mockup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Item</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 hover:border-brand-orange hover:text-brand-orange cursor-pointer transition-colors">
                <Upload className="mx-auto mb-2" />
                <span>Upload Image</span>
              </div>
              <input type="text" placeholder="Item Name" className="w-full px-4 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Price" className="w-full px-4 py-2 border rounded-lg" />
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Select Category</option>
                  <option>Specials</option>
                  <option>Soups</option>
                </select>
              </div>
              <textarea placeholder="Description" rows={3} className="w-full px-4 py-2 border rounded-lg"></textarea>
              <button onClick={() => { setIsModalOpen(false); alert('Mock Item Added'); }} className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;