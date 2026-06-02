import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [notification, setNotification] = useState(null);
  const [viewingItem, setViewingItem] = useState(null); 
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State for tracking timestamps
  const [timestamps, setTimestamps] = useState({});

  const API_URL = 'https://production-inventory-system.onrender.com';

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Naya aur fast Timestamp Sync Function
  const syncTimestamps = (pData, cData, oData) => {
    let saved = JSON.parse(localStorage.getItem('app_timestamps')) || {};
    let isUpdated = false;
    const now = new Date().toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });

    pData.forEach(p => { if (!saved[`product-${p.id}`]) { saved[`product-${p.id}`] = now; isUpdated = true; } });
    cData.forEach(c => { if (!saved[`customer-${c.id}`]) { saved[`customer-${c.id}`] = now; isUpdated = true; } });
    oData.forEach(o => { if (!saved[`order-${o.id}`]) { saved[`order-${o.id}`] = now; isUpdated = true; } });

    if (isUpdated) {
      localStorage.setItem('app_timestamps', JSON.stringify(saved));
    }
    setTimestamps(saved);
  };

  const fetchData = async () => {
    try {
      const pRes = await fetch(`${API_URL}/products/`);
      const cRes = await fetch(`${API_URL}/customers/`);
      const oRes = await fetch(`${API_URL}/orders/`);
      const pData = await pRes.json();
      const cData = await cRes.json();
      const oData = await oRes.json();
      
      setProducts(pData);
      setCustomers(cData);
      setOrders(oData);
      
      // Sync timestamps immediately after fetching data
      syncTimestamps(pData, cData, oData);
    } catch (err) {
      showNotification("Database connection failed!", "error");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewItem = async (endpoint, typeSingular, id) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`);
      if(res.ok) {
        const data = await res.json();
        setViewingItem({ type: typeSingular, data });
      } else {
        showNotification(`Failed to fetch ${typeSingular} details`, "error");
      }
    } catch(err) {
      showNotification("Server error fetching details", "error");
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: e.target.name.value,
          sku: e.target.sku.value,
          price: parseFloat(e.target.price.value),
          stock: parseInt(e.target.stock.value)
        })
      });
      if(res.ok) { 
        showNotification("Product Added Successfully!"); 
        await fetchData(); e.target.reset(); 
      } else { 
        const err = await res.json(); 
        showNotification(`Validation Error: ${err.detail}`, "error"); 
      }
    } catch(err) { showNotification("Server error", "error"); }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: e.target.name.value,
          sku: e.target.sku.value,
          price: parseFloat(e.target.price.value),
          stock: parseInt(e.target.stock.value)
        })
      });
      if(res.ok) { 
        showNotification("Product Updated Successfully!"); 
        
        // Edit karne par naya time update karna
        const newTime = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        const saved = JSON.parse(localStorage.getItem('app_timestamps')) || {};
        saved[`product-${editingProduct.id}`] = newTime;
        localStorage.setItem('app_timestamps', JSON.stringify(saved));
        setTimestamps(saved);
        
        setEditingProduct(null); await fetchData(); 
      } else { 
        const err = await res.json(); showNotification(err.detail, "error"); 
      }
    } catch(err) { showNotification("Server error", "error"); }
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showNotification("Please enter a valid email address!", "error"); return; }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) { showNotification("Please enter a valid 10-digit phone number!", "error"); return; }

    try {
      const res = await fetch(`${API_URL}/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: e.target.name.value, email: email, phone: phone })
      });
      if(res.ok) { 
        showNotification("Customer Added Successfully!"); 
        await fetchData(); e.target.reset(); 
      } else { 
        const err = await res.json(); showNotification(`Validation Error: ${err.detail}`, "error"); 
      }
    } catch(err) { showNotification("Server error", "error"); }
  };

  const addOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(e.target.customerId.value),
          product_id: parseInt(e.target.productId.value),
          quantity: parseInt(e.target.quantity.value)
        })
      });
      if(res.ok) { 
        showNotification("Order created! Product stock reduced automatically."); 
        await fetchData(); e.target.reset(); 
      } else { 
        const err = await res.json(); showNotification(`Order Failed: ${err.detail}`, "error"); 
      }
    } catch(err) { showNotification("Server error", "error"); }
  };

  const deleteItem = async (type, id) => {
    if(window.confirm(`Are you sure you want to delete this?`)) {
      await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
      showNotification(`${type.toUpperCase()} item deleted successfully! (Stock restored if applicable)`);
      await fetchData(); setViewingItem(null);
    }
  };

  const lowStockProducts = products.filter(p => p.stock < 20);
  const getProductName = (id) => products.find(p => p.id === id)?.name || "Unknown";
  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || "Unknown";
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="app-container">
      
      {/* ANIMATED POPUP MODAL WITH TIMESTAMPS */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {viewingItem.type === 'product' && <h4>📦 Product Details</h4>}
              {viewingItem.type === 'customer' && <h4>👤 Customer Details</h4>}
              {viewingItem.type === 'order' && <h4>🛒 Order Details</h4>}
            </div>
            
            <div className="modal-body">
              {viewingItem.type === 'product' && (
                <>
                  <p><strong>System ID</strong> <span>#{viewingItem.data.id}</span></p>
                  <p><strong>Last Updated</strong> <span>{timestamps[`product-${viewingItem.data.id}`] || 'N/A'}</span></p>
                  <p><strong>Name</strong> <span>{viewingItem.data.name}</span></p>
                  <p><strong>SKU/Code</strong> <span>{viewingItem.data.sku}</span></p>
                  <p><strong>Unit Price</strong> <span>${viewingItem.data.price.toFixed(2)}</span></p>
                  <p><strong>Current Stock</strong> <span><span className={`badge ${viewingItem.data.stock < 20 ? 'badge-danger' : 'badge-success'}`}>{viewingItem.data.stock} units</span></span></p>
                </>
              )}
              {viewingItem.type === 'customer' && (
                <>
                  <p><strong>System ID</strong> <span>#{viewingItem.data.id}</span></p>
                  <p><strong>Time Registered</strong> <span>{timestamps[`customer-${viewingItem.data.id}`] || 'N/A'}</span></p>
                  <p><strong>Full Name</strong> <span>{viewingItem.data.name}</span></p>
                  <p><strong>Email Address</strong> <span>{viewingItem.data.email}</span></p>
                  <p><strong>Phone Number</strong> <span>{viewingItem.data.phone}</span></p>
                </>
              )}
              {viewingItem.type === 'order' && (
                <>
                  <p><strong>Order ID</strong> <span>#{viewingItem.data.id}</span></p>
                  <p><strong>Time Created</strong> <span>{timestamps[`order-${viewingItem.data.id}`] || 'N/A'}</span></p>
                  <p><strong>Customer</strong> <span>{getCustomerName(viewingItem.data.customer_id)}</span></p>
                  <p><strong>Product</strong> <span>{getProductName(viewingItem.data.product_id)}</span></p>
                  <p><strong>Quantity Ordered</strong> <span>{viewingItem.data.quantity}</span></p>
                  <p><strong>Total Amount</strong> <span style={{color: 'var(--success)', fontWeight: 'bold'}}>${viewingItem.data.total_amount.toFixed(2)}</span></p>
                </>
              )}
            </div>
            <button className="modal-close-btn" onClick={() => setViewingItem(null)}>Close</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <h2>Production-Ready Inventory System</h2>
        <div className="nav-container">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => {setActiveTab('dashboard'); setViewingItem(null);}}>Dashboard</button>
          <button className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => {setActiveTab('products'); setViewingItem(null);}}>Products</button>
          <button className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => {setActiveTab('customers'); setViewingItem(null);}}>Customers</button>
          <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => {setActiveTab('orders'); setViewingItem(null);}}>Orders</button>
          <button className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => {setActiveTab('inventory'); setViewingItem(null);}}>Inventory Tracking</button>
        </div>
      </div>

      <div className="content-area">
        
        {/* NOTIFICATIONS */}
        {notification && (
          <div className={`notification ${notification.type === 'error' ? 'notify-error' : 'notify-success'}`}>
            {notification.type === 'error' ? '❌' : '✅'} {notification.message}
          </div>
        )}

        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h3 className="section-title">System Summary Dashboard</h3>
            <p className="page-description">Get a quick overview of your entire business operations and current inventory health.</p>
            
            <div className="dashboard-cards">
              <div className="card" onClick={() => {setActiveTab('products'); setViewingItem(null);}}>
                <h4>Total Products</h4><h2>{products.length}</h2>
              </div>
              <div className="card" onClick={() => {setActiveTab('customers'); setViewingItem(null);}}>
                <h4>Total Customers</h4><h2>{customers.length}</h2>
              </div>
              <div className="card" onClick={() => {setActiveTab('orders'); setViewingItem(null);}}>
                <h4>Total Orders</h4><h2>{orders.length}</h2>
              </div>
              <div className="card" onClick={() => {setActiveTab('inventory'); setViewingItem(null);}}>
                <h4>Inventory Value</h4><h2 style={{color: 'var(--success)'}}>${totalInventoryValue.toFixed(2)}</h2>
              </div>
            </div>
            
            {lowStockProducts.length > 0 && (
              <div className="fade-in" style={{marginTop: '40px'}}>
                <h4 style={{color: 'var(--danger)', marginBottom: '15px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{fontSize: '24px'}}>⚠️</span> Low Stock Products Alert (Below 20 units)
                </h4>
                <div className="table-container" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>SKU / Code</th>
                        <th>Stock Left</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map(p => (
                        <tr key={p.id} style={{backgroundColor: '#fffaf0'}}>
                          <td><strong>#{p.id}</strong></td>
                          <td><strong style={{color: 'var(--text-main)'}}>{p.name}</strong></td>
                          <td>{p.sku}</td>
                          <td><span style={{color: 'var(--danger)', fontWeight: '800', fontSize: '16px'}}>{p.stock} units</span></td>
                          <td><span className="badge badge-danger">Needs Restock</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PRODUCTS --- */}
        {activeTab === 'products' && (
          <div className="fade-in">
            <h3 className="section-title">{editingProduct ? "Update Product" : "Product Management"}</h3>
            <p className="page-description">Add new items to your catalog, update pricing, and manage stock quantities.</p>
            
            <div className="form-container">
              {editingProduct ? (
                <form onSubmit={updateProduct} className="custom-form">
                  <input name="name" defaultValue={editingProduct.name} required />
                  <input name="sku" defaultValue={editingProduct.sku} disabled title="SKU cannot be edited" />
                  <input name="price" type="number" step="0.01" min="0" defaultValue={editingProduct.price} required />
                  <input name="stock" type="number" min="0" defaultValue={editingProduct.stock} required />
                  <button type="submit" className="action-btn btn-warning" style={{padding: '14px 28px', fontSize: '15px'}}>Update Product</button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="action-btn btn-danger" style={{padding: '14px 28px', fontSize: '15px'}}>Cancel</button>
                </form>
              ) : (
                <form onSubmit={addProduct} className="custom-form">
                  <input name="name" placeholder="Product Name" required />
                  <input name="sku" placeholder="SKU Code (Must be unique)" required />
                  <input name="price" type="number" step="0.01" min="0" placeholder="Price ($)" required />
                  <input name="stock" type="number" min="0" placeholder="Quantity in Stock" required />
                  <button type="submit" className="action-btn btn-success">Add Product</button>
                </form>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Time Added</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><strong>#{p.id}</strong></td>
                      <td style={{fontSize: '13px', color: '#666'}}>{timestamps[`product-${p.id}`] || 'N/A'}</td>
                      <td>{p.name}</td><td>{p.sku}</td>
                      <td style={{fontWeight: '600'}}>${p.price.toFixed(2)}</td>
                      <td><span className={`badge ${p.stock < 20 ? 'badge-danger' : 'badge-success'}`}>{p.stock}</span></td>
                      <td>
                        <button onClick={() => handleViewItem('products', 'product', p.id)} className="action-btn btn-info">View</button>
                        <button onClick={() => setEditingProduct(p)} className="action-btn btn-warning">Edit</button>
                        <button onClick={() => deleteItem('products', p.id)} className="action-btn btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CUSTOMERS --- */}
        {activeTab === 'customers' && (
          <div className="fade-in">
            <h3 className="section-title">Customer Management</h3>
            <p className="page-description">Maintain your customer database. Add new clients and manage their contact details.</p>
            
            <div className="form-container">
              <form onSubmit={addCustomer} className="custom-form">
                <input name="name" placeholder="Full Name" required />
                <input name="email" type="email" placeholder="Email Address (Must be unique)" required />
                <input name="phone" placeholder="Phone Number" required />
                <button type="submit" className="action-btn btn-success">Add Customer</button>
              </form>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Time Registered</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td><strong>#{c.id}</strong></td>
                      <td style={{fontSize: '13px', color: '#666'}}>{timestamps[`customer-${c.id}`] || 'N/A'}</td>
                      <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td>
                      <td>
                        <button onClick={() => handleViewItem('customers', 'customer', c.id)} className="action-btn btn-info">View</button>
                        <button onClick={() => deleteItem('customers', c.id)} className="action-btn btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <h3 className="section-title">Order Management</h3>
            <p className="page-description">Create new orders for customers. Stock quantities will be automatically updated.</p>
            
            <div className="form-container">
              <form onSubmit={addOrder} className="custom-form">
                <select name="customerId" required>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} (ID: {c.id})</option>)}
                </select>
                
                <select name="productId" required>
                  <option value="">-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
                
                <input name="quantity" type="number" placeholder="Quantity Ordered" required min="1" />
                <button type="submit" className="action-btn btn-success">Create Order</button>
              </form>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Time Created</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td style={{fontSize: '13px', color: '#666'}}>{timestamps[`order-${o.id}`] || 'N/A'}</td>
                      <td>{getCustomerName(o.customer_id)}</td>
                      <td>{getProductName(o.product_id)}</td>
                      <td>{o.quantity}</td>
                      <td style={{fontWeight: '800', color: 'var(--success)'}}>${o.total_amount.toFixed(2)}</td>
                      <td>
                        <button onClick={() => handleViewItem('orders', 'order', o.id)} className="action-btn btn-info">View</button>
                        <button onClick={() => deleteItem('orders', o.id)} className="action-btn btn-danger">Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- INVENTORY TRACKING (Time Next to SKU) --- */}
        {activeTab === 'inventory' && (
          <div className="fade-in">
            <h3 className="section-title">Detailed Inventory Tracking</h3>
            <p className="page-description">Monitor your stock levels in real-time. Identify products that need immediate restocking.</p>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>SKU / Code</th>
                    <th>Last Updated Time</th> {/* <-- SKU ke baad time */}
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><strong>#{p.id}</strong></td>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td style={{fontSize: '13px', color: '#666'}}>{timestamps[`product-${p.id}`] || 'N/A'}</td>
                      <td style={{fontWeight: '700'}}>{p.stock} units</td>
                      <td>
                        {p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                         p.stock < 20 ? <span className="badge badge-warning">Low Stock</span> :
                         <span className="badge badge-success">In Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>© 2026 Production-Ready Inventory Management System | Fully Containerized Architecture</p>
      </footer>
    </div>
  );
}

export default App;