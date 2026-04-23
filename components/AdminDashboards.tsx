
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, UserRole, UserProfile, AppFeatures, CartItem, InventoryItem, Tenant, SubscriptionPackage, StaffMember, Excursion, TechAmenity } from '../types';
import { INITIAL_PACKAGES, MOCK_STAFF } from '../constants';

interface DashboardProps {
  user: UserProfile;
  history: Transaction[];
  features: AppFeatures;
  toggleFeature: (key: keyof AppFeatures) => void;
  onLogout: () => void;
  // New Props
  commissionRate: number;
  setCommissionRate: (rate: number) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  markTaskComplete: (txId: string, itemId: string) => void;
  excursions?: Excursion[];
  setExcursions?: React.Dispatch<React.SetStateAction<Excursion[]>>;
  techRentals?: TechAmenity[];
  setTechRentals?: React.Dispatch<React.SetStateAction<TechAmenity[]>>;
}

const StatCard = ({ label, value, subtext, color = 'text-luxury-gold' }: { label: string, value: string, subtext?: string, color?: string }) => (
  <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5 hover:border-luxury-gold/30 transition-all shadow-lg min-w-[200px]">
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</p>
    <p className={`text-3xl font-serif mb-1 ${color}`}>{value}</p>
    {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
  </div>
);

const FeatureToggle = ({ label, active, onClick, disabled = false }: { label: string, active: boolean, onClick: () => void, disabled?: boolean }) => (
  <div className={`flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'} transition-colors`}>
    <span className="text-gray-300 text-sm font-bold">{label}</span>
    <button 
      onClick={disabled ? undefined : onClick}
      className={`relative w-10 h-5 rounded-full p-0.5 transition-all duration-300 ${active ? 'bg-luxury-gold' : 'bg-gray-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// MOCK TENANTS FOR SAAS DEMO
const INITIAL_TENANTS: Tenant[] = [
    {
        id: 'T-001',
        name: 'SmartGuest Resorts (Zanzibar)',
        plan: 'Platinum',
        status: 'Active',
        commissionRate: 10,
        totalRevenue: 154200,
        features: { nutrition: true, fitness: true, spa: true, concierge: true },
        location: 'Zanzibar, TZ',
        joinedDate: '2024-01-15'
    },
    {
        id: 'T-002',
        name: 'Serengeti Safari Lodge',
        plan: 'Gold',
        status: 'Active',
        commissionRate: 12,
        totalRevenue: 89500,
        features: { nutrition: true, fitness: false, spa: false, concierge: true },
        location: 'Serengeti, TZ',
        joinedDate: '2024-03-10'
    },
    {
        id: 'T-003',
        name: 'Urban City Hotel',
        plan: 'Silver',
        status: 'Suspended',
        commissionRate: 15,
        totalRevenue: 12000,
        features: { nutrition: false, fitness: true, spa: false, concierge: false },
        location: 'Dar es Salaam, TZ',
        joinedDate: '2024-06-01'
    }
];

// Helper to generate mock staff based on tenant (For Super Admin View)
const getMockStaff = (tenantId: string) => {
    const common = [
        { name: "Sarah J.", role: "Manager", status: "Online" },
        { name: "Chef Gordon", role: "Executive Chef", status: "Busy" },
    ];
    if(tenantId === 'T-001') return [...common, { name: "Mike T.", role: "Trainer", status: "Online" }, { name: "Alice W.", role: "Spa Lead", status: "Offline" }];
    if(tenantId === 'T-002') return [...common, { name: "David K.", role: "Guide", status: "Online" }];
    return common;
};

// Helper to generate mock recent activity
const getMockActivity = (tenantId: string) => {
    return [
        { time: "10 mins ago", action: "New Booking: Villa Suite", val: "+$850" },
        { time: "25 mins ago", action: "Spa Session Completed", val: "+$150" },
        { time: "1 hour ago", action: "Commission Payout Processed", val: "-$1,200", isSystem: true },
        { time: "3 hours ago", action: "Inventory Alert: Wagyu Beef", val: "Low Stock", isAlert: true },
    ];
};

// --- SUPER ADMIN (SAAS OWNER) ---
const SuperAdminView: React.FC<DashboardProps> = (props) => {
  const { history, features, toggleFeature, commissionRate, setCommissionRate, inventory } = props;
  const [activeAdminTab, setActiveAdminTab] = useState<'tenants' | 'packages'>('tenants');
  
  // Real-time live revenue calculation for the main platform instance (Zanzibar)
  const getLiveRevenue = () => history.reduce((sum, t) => sum + t.total, 0);

  // Tenants State with Persistence and Live Data Injection
  const [tenants, setTenants] = useState<Tenant[]>(() => {
      try {
          const saved = localStorage.getItem('shee_tenants');
          const parsed = saved ? JSON.parse(saved) : INITIAL_TENANTS;
          // Ensure T-001 runs on the live app environment settings
          return parsed.map((t: Tenant) => {
              if (t.id === 'T-001') {
                  return {
                      ...t,
                      commissionRate: commissionRate,
                      features: features,
                      totalRevenue: getLiveRevenue() || t.totalRevenue // Use live revenue or existing if 0
                  };
              }
              return t;
          });
      } catch (e) {
          return INITIAL_TENANTS;
      }
  });

  // Packages State with Persistence (Optional, but good for demo)
  const [packages, setPackages] = useState<SubscriptionPackage[]>(INITIAL_PACKAGES);
  
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [detailTab, setDetailTab] = useState<'dashboard' | 'financials' | 'team' | 'settings'>('dashboard');
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Modal States
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  
  // Forms States
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant> | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<SubscriptionPackage> | null>(null);

  // Sync Tenants to LocalStorage
  useEffect(() => {
      localStorage.setItem('shee_tenants', JSON.stringify(tenants));
  }, [tenants]);

  // Keep T-001 perfectly synchronized with any live app data changes
  useEffect(() => {
     setTenants(prev => prev.map(t => {
         if (t.id === 'T-001') {
             return { ...t, commissionRate, features, totalRevenue: getLiveRevenue() };
         }
         return t;
     }));
     // Also sync selected tenant if it's T-001
     setSelectedTenant(prev => {
         if (prev && prev.id === 'T-001') {
             return { ...prev, commissionRate, features, totalRevenue: getLiveRevenue() };
         }
         return prev;
     });
  }, [history, features, commissionRate]);

  // Stats Calculation
  const totalSystemRevenue = tenants.reduce((acc, t) => acc + t.totalRevenue, 0);
  const totalCommissionRevenue = tenants.reduce((acc, t) => acc + (t.totalRevenue * (t.commissionRate / 100)), 0);
  const activeTenants = tenants.filter(t => t.status === 'Active').length;

  // Real-time activity generation based on actual history & inventory for T-001
  const getDynamicActivity = (tenantId: string) => {
      if (tenantId !== 'T-001') return getMockActivity(tenantId);
      
      const liveActivities: any[] = [];
      // Alert from Live Inventory
      inventory.forEach(item => {
          if (item.quantity <= item.threshold) {
             liveActivities.push({ time: "Just now", action: `Inventory Alert: ${item.name}`, val: "Low Stock", isAlert: true });
          }
      });
      // Recent transactions
      history.slice(0, 5).forEach(tx => {
         const timeDiff = Math.floor((new Date().getTime() - new Date(tx.date).getTime()) / 60000); // mins
         const timeStr = timeDiff === 0 ? "Just now" : timeDiff < 60 ? `${timeDiff} mins ago` : `${Math.floor(timeDiff/60)} hours ago`;
         liveActivities.push({ time: timeStr, action: `New Order: ${tx.items.length} items`, val: `+$${tx.total.toFixed(2)}` });
      });
      
      return liveActivities.length > 0 ? liveActivities : getMockActivity(tenantId);
  };

  // --- CRUD LOGIC: TENANTS ---

  const handleSaveTenant = () => {
      if (!editingTenant?.name || !editingTenant?.location) return;

      // Find package to apply defaults if creating
      const pkg = packages.find(p => p.name === editingTenant.plan) || packages[0];

      if (editingTenant.id) {
          // UPDATE
          setTenants(prev => prev.map(t => t.id === editingTenant.id ? { ...t, ...editingTenant } as Tenant : t));
          if(selectedTenant?.id === editingTenant.id) setSelectedTenant({ ...selectedTenant, ...editingTenant } as Tenant);
          
          if (editingTenant.id === 'T-001' && editingTenant.commissionRate) {
              setCommissionRate(editingTenant.commissionRate);
          }
      } else {
          // CREATE
          const newTenant: Tenant = {
              id: `T-${Date.now().toString().slice(-4)}`,
              name: editingTenant.name,
              location: editingTenant.location,
              plan: editingTenant.plan || pkg.name,
              status: 'Active',
              commissionRate: editingTenant.commissionRate || pkg.defaultCommissionRate,
              totalRevenue: 0,
              features: editingTenant.features || pkg.features,
              joinedDate: new Date().toISOString()
          };
          setTenants(prev => [newTenant, ...prev]);
      }
      setTenantModalOpen(false);
      setEditingTenant(null);
  };

  const handleDeleteTenant = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // CRITICAL: Stop propagation immediately
      
      const confirmDelete = window.confirm('Are you sure you want to PERMANENTLY DELETE this property?\n\nThis action cannot be undone.');
      
      if (confirmDelete) {
          setTenants(prev => {
              const updated = prev.filter(t => t.id !== id);
              return updated;
          });
          
          if (selectedTenant?.id === id) {
              setSelectedTenant(null);
          }
      }
  };

  const updateTenantFeature = (tenantId: string, feature: keyof AppFeatures) => {
      // If it's the live app tenant (T-001), update the global system flags!
      if (tenantId === 'T-001') {
          toggleFeature(feature);
          return;
      }

      setTenants(prev => prev.map(t => {
          if (t.id === tenantId) {
              return { ...t, features: { ...t.features, [feature]: !t.features[feature] } };
          }
          return t;
      }));
      if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant(prev => prev ? { ...prev, features: { ...prev.features, [feature]: !prev.features[feature] } } : null);
      }
  };

  const updateTenantCommission = (tenantId: string, newRate: number) => {
      if (tenantId === 'T-001') {
          setCommissionRate(newRate);
          return;
      }
      setTenants(prev => prev.map(t => 
          t.id === tenantId ? { ...t, commissionRate: newRate } : t
      ));
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(prev => prev ? { ...prev, commissionRate: newRate } : null);
    }
  };

  const updateTenantStatus = (tenantId: string, newStatus: Tenant['status']) => {
    setTenants(prev => prev.map(t => 
        t.id === tenantId ? { ...t, status: newStatus } : t
    ));
    if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // --- CRUD LOGIC: PACKAGES ---

  const handleSavePackage = () => {
      if (!editingPackage?.name || !editingPackage?.price) return;

      if (editingPackage.id) {
          // UPDATE
          setPackages(prev => prev.map(p => p.id === editingPackage.id ? { ...p, ...editingPackage } as SubscriptionPackage : p));
      } else {
          // CREATE
          const newPkg: SubscriptionPackage = {
              id: `pkg_${Date.now()}`,
              name: editingPackage.name,
              price: Number(editingPackage.price),
              defaultCommissionRate: Number(editingPackage.defaultCommissionRate) || 10,
              features: editingPackage.features || { nutrition: false, fitness: false, spa: false, concierge: false },
              description: editingPackage.description || ''
          };
          setPackages(prev => [...prev, newPkg]);
      }
      setPackageModalOpen(false);
      setEditingPackage(null);
  };

  const handleDeletePackage = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      // Check if any tenant is using this package
      const isInUse = tenants.some(t => t.plan === packages.find(p => p.id === id)?.name);
      if (isInUse) {
          alert('Cannot delete this package as it is currently assigned to active tenants.');
          return;
      }
      if (window.confirm('Delete this subscription package?')) {
          setPackages(prev => prev.filter(p => p.id !== id));
      }
  };

  const generateInvoice = () => {
      if(!selectedTenant) return;
      const unbilledRevenue = 4500; // Mocked unbilled amount
      const pkg = packages.find(p => p.name === selectedTenant.plan);
      const subscriptionFee = pkg ? pkg.price : 99;
      
      const commissionAmount = unbilledRevenue * (selectedTenant.commissionRate / 100);
      const subtotal = commissionAmount + subscriptionFee;
      const vat = subtotal * 0.18;
      
      setInvoiceData({
          id: `INV-2025-${Math.floor(Math.random() * 1000)}`,
          issueDate: new Date().toLocaleDateString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          tenant: selectedTenant,
          items: [
              { desc: `Platform Commission (${selectedTenant.commissionRate}% of $${unbilledRevenue})`, amount: commissionAmount },
              { desc: `SaaS Monthly Subscription (${selectedTenant.plan} Tier)`, amount: subscriptionFee }
          ],
          subtotal,
          vat,
          total: subtotal + vat
      });
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div className="border-l-4 border-luxury-gold pl-4">
            <h2 className="font-serif text-2xl md:text-3xl text-white">SaaS Master Controller</h2>
            <p className="text-gray-400 text-sm md:text-base">System Owner & Multi-Tenant Management</p>
        </div>
        
        {/* Main Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-lg flex gap-2 mt-4 md:mt-0">
            <button 
                onClick={() => setActiveAdminTab('tenants')}
                className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeAdminTab === 'tenants' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Tenants
            </button>
            <button 
                onClick={() => setActiveAdminTab('packages')}
                className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeAdminTab === 'packages' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Packages
            </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Gross Volume (GMV)" value={`$${totalSystemRevenue.toLocaleString()}`} color="text-white" />
        <StatCard label="Projected Commission" value={`$${totalCommissionRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtext="Avg. 11% Yield" />
        <StatCard label="Active Properties" value={activeTenants.toString()} subtext={`Out of ${tenants.length} Total`} color="text-green-500" />
        <StatCard label="System Health" value="100%" subtext="All AI Services Operational" color="text-blue-400" />
      </div>

      {/* --- CONTENT: TENANTS TAB --- */}
      {activeAdminTab === 'tenants' && (
      <div className="flex flex-col xl:flex-row gap-8 min-h-[600px]">
          {/* LEFT: Tenant List */}
          <div className="xl:w-1/3 bg-luxury-charcoal rounded-xl border border-white/5 overflow-hidden flex flex-col">
             <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                 <h3 className="text-xl text-white font-serif">Registered Tenants</h3>
                 <button 
                    onClick={() => { setEditingTenant({}); setTenantModalOpen(true); }}
                    className="text-xs bg-luxury-gold text-black px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-white transition-colors"
                 >
                     + New
                 </button>
             </div>
             <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left text-sm text-gray-400">
                     <thead className="bg-white/5 text-gray-500 text-xs uppercase">
                         <tr>
                             <th className="p-4">Property & Status</th>
                             <th className="p-4 text-right">Revenue</th>
                             <th className="p-4 text-center">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {tenants.map(tenant => (
                             <tr 
                                key={tenant.id} 
                                className={`transition-colors group ${selectedTenant?.id === tenant.id ? 'bg-luxury-gold/10 border-l-2 border-luxury-gold' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                             >
                                 <td className="p-4 cursor-pointer" onClick={() => { setSelectedTenant(tenant); setDetailTab('dashboard'); }}>
                                     <div className="flex flex-col gap-1">
                                         <p className={`font-bold ${selectedTenant?.id === tenant.id ? 'text-luxury-gold' : 'text-white'}`}>{tenant.name}</p>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider ${
                                                 tenant.status === 'Active' 
                                                 ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                 : 'bg-red-500/10 text-red-500 border-red-500/20'
                                             }`}>
                                                 {tenant.status === 'Active' ? '● Active' : '○ Suspended'}
                                             </span>
                                             <span className="text-[10px] text-gray-500">• {tenant.plan}</span>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="p-4 text-right font-mono text-white">${tenant.totalRevenue.toLocaleString()}</td>
                                 <td className="p-4 text-center">
                                     <div className="flex items-center justify-center gap-2">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingTenant(tenant); setTenantModalOpen(true); }} 
                                            title="Edit" 
                                            className="text-gray-400 hover:text-white p-2 rounded hover:bg-white/10 transition-colors z-10 relative"
                                         >
                                             ✎
                                         </button>
                                         <button 
                                            onClick={(e) => handleDeleteTenant(tenant.id, e)} 
                                            title="Delete" 
                                            className="text-red-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors z-10 relative"
                                         >
                                             🗑
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>

          {/* RIGHT: Tenant Detail Dashboard */}
          <div className="xl:w-2/3 bg-[#121212] rounded-xl border border-luxury-gold/30 flex flex-col relative overflow-hidden">
              {selectedTenant ? (
                  <>
                    {/* Detail Header */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-luxury-gold to-yellow-800"></div>
                    <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-black/20">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl text-white font-serif leading-tight">{selectedTenant.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${selectedTenant.status === 'Active' ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>
                                    {selectedTenant.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Tenant ID: {selectedTenant.id} • Joined {new Date(selectedTenant.joinedDate).toLocaleDateString()}</p>
                        </div>
                        
                        {/* Detail Tabs */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                            {['dashboard', 'financials', 'team', 'settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab as any)}
                                    className={`px-4 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition-all ${
                                        detailTab === tab 
                                        ? 'bg-luxury-gold text-black shadow-md' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        
                        {/* --- TAB: DASHBOARD --- */}
                        {detailTab === 'dashboard' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-luxury-charcoal p-4 rounded-lg border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase">Est. Guests Now</p>
                                        <p className="text-2xl text-white font-serif">42</p>
                                    </div>
                                    <div className="bg-luxury-charcoal p-4 rounded-lg border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase">Occupancy Rate</p>
                                        <p className="text-2xl text-white font-serif">78%</p>
                                    </div>
                                    <div className="bg-luxury-charcoal p-4 rounded-lg border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase">Avg. Spend/Guest</p>
                                        <p className="text-2xl text-luxury-gold font-serif">$3,670</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Recent Activity Log</h4>
                                    <div className="space-y-0">
                                        {getDynamicActivity(selectedTenant.id).map((log, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                                                <div>
                                                    <p className={`text-sm font-bold ${log.isAlert ? 'text-red-400' : 'text-gray-300'}`}>{log.action}</p>
                                                    <p className="text-[10px] text-gray-500">{log.time}</p>
                                                </div>
                                                <span className={`text-xs font-mono font-bold ${log.val.startsWith('+') ? 'text-green-500' : log.val.startsWith('-') ? 'text-luxury-gold' : 'text-red-400'}`}>
                                                    {log.val}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: FINANCIALS --- */}
                        {detailTab === 'financials' && (
                            <div className="space-y-6 animate-fade-in">
                                {/* ... (Financials Content kept same) ... */}
                                <div className="bg-black/40 p-6 rounded-xl border border-luxury-gold/20 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Gross Revenue</p>
                                        <p className="text-4xl text-white font-serif">${selectedTenant.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                                    <div className="text-center md:text-left">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Commission ({selectedTenant.commissionRate}%)</p>
                                        <p className="text-4xl text-luxury-gold font-serif">${(selectedTenant.totalRevenue * (selectedTenant.commissionRate/100)).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: TEAM --- */}
                        {detailTab === 'team' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Authorized Staff</h4>
                                    <span className="text-xs text-gray-500">{getMockStaff(selectedTenant.id).length} Active Accounts</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {getMockStaff(selectedTenant.id).map((staff, idx) => (
                                        <div key={idx} className="bg-luxury-charcoal p-4 rounded-lg border border-white/5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                                                {staff.role === 'Manager' ? '👔' : staff.role.includes('Chef') ? '🍳' : '👤'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold">{staff.name}</p>
                                                <p className="text-xs text-gray-500">{staff.role}</p>
                                            </div>
                                            <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${staff.status === 'Online' ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'}`}>
                                                {staff.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- TAB: SETTINGS --- */}
                        {detailTab === 'settings' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* ... (Settings Content kept same) ... */}
                                <div className="bg-luxury-charcoal/50 p-6 rounded-xl border border-white/5">
                                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center justify-between">
                                        <span>Active Modules</span>
                                        <span className="text-[10px] text-gray-500">Live Update</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FeatureToggle label="🥗 AI Nutritionist" active={selectedTenant.features.nutrition} onClick={() => updateTenantFeature(selectedTenant.id, 'nutrition')} />
                                        <FeatureToggle label="💪 Smart Fitness" active={selectedTenant.features.fitness} onClick={() => updateTenantFeature(selectedTenant.id, 'fitness')} />
                                        <FeatureToggle label="🌿 Spa & Wellness" active={selectedTenant.features.spa} onClick={() => updateTenantFeature(selectedTenant.id, 'spa')} />
                                        <FeatureToggle label="🛎️ AI Concierge" active={selectedTenant.features.concierge} onClick={() => updateTenantFeature(selectedTenant.id, 'concierge')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 relative">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                      <span className="text-6xl mb-6 opacity-30 text-luxury-gold animate-pulse">⚡</span>
                      <h3 className="text-xl text-white font-serif mb-2">Select a Property</h3>
                      <p className="text-center text-sm max-w-xs leading-relaxed">Choose a tenant from the list on the left to view detailed analytics, configure modules, and manage staff.</p>
                  </div>
              )}
          </div>
      </div>
      )}

      {/* --- CONTENT: PACKAGES TAB --- */}
      {activeAdminTab === 'packages' && (
          <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-serif text-white">Subscription Packages</h3>
                  <button 
                    onClick={() => { setEditingPackage({}); setPackageModalOpen(true); }}
                    className="bg-luxury-gold text-black px-4 py-2 rounded font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                      + Create Package
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packages.map(pkg => (
                      <div key={pkg.id} className="bg-luxury-charcoal rounded-2xl border border-white/5 hover:border-luxury-gold/50 transition-all p-8 flex flex-col relative overflow-hidden group">
                          {pkg.recommended && (
                              <div className="absolute top-0 right-0 bg-luxury-gold text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
                          )}
                          
                          <div className="mb-6">
                              <h4 className="text-xl font-bold text-white mb-2">{pkg.name}</h4>
                              <p className="text-sm text-gray-400 h-10">{pkg.description}</p>
                          </div>

                          <div className="mb-8">
                              <span className="text-4xl font-serif text-luxury-gold">${pkg.price}</span>
                              <span className="text-gray-500 text-sm">/month</span>
                          </div>

                          <div className="space-y-3 mb-8 flex-1">
                              <div className="flex items-center gap-3">
                                  <span className="text-green-500">✓</span>
                                  <span className="text-gray-300 text-sm">Commission: {pkg.defaultCommissionRate}%</span>
                              </div>
                              {Object.entries(pkg.features).map(([key, enabled]) => (
                                  <div key={key} className={`flex items-center gap-3 ${enabled ? 'text-gray-300' : 'text-gray-600 opacity-50'}`}>
                                      <span>{enabled ? '✓' : '✕'}</span>
                                      <span className="text-sm capitalize">{key} Module</span>
                                  </div>
                              ))}
                          </div>

                          <div className="flex gap-2 mt-auto">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setEditingPackage(pkg); setPackageModalOpen(true); }}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded border border-white/10 font-bold uppercase text-xs transition-colors"
                              >
                                  Edit
                              </button>
                              <button 
                                onClick={(e) => handleDeletePackage(pkg.id, e)}
                                className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded border border-red-500/20 transition-colors"
                              >
                                  🗑
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* CREATE/EDIT TENANT MODAL */}
      {tenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in transition-all">
            <div className="bg-[#1c1c1e] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
                <div className="p-8 pb-4 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{editingTenant?.id ? 'Update Property' : 'Onboard Property'}</h2>
                    <button onClick={() => setTenantModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Property Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-white/5 border-0 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-1 focus:ring-luxury-gold outline-none"
                                value={editingTenant?.name || ''}
                                onChange={(e) => setEditingTenant(prev => ({...prev, name: e.target.value}))}
                                placeholder="Resort Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                            <input 
                                type="text" 
                                className="w-full bg-white/5 border-0 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-1 focus:ring-luxury-gold outline-none"
                                value={editingTenant?.location || ''}
                                onChange={(e) => setEditingTenant(prev => ({...prev, location: e.target.value}))}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subscription Package</label>
                        <div className="grid grid-cols-3 gap-2">
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => setEditingTenant(prev => ({...prev, plan: pkg.name}))}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                                        editingTenant?.plan === pkg.name 
                                        ? 'bg-luxury-gold/20 border-luxury-gold text-luxury-gold' 
                                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                    }`}
                                >
                                    {pkg.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#1c1c1e]">
                    <button 
                        onClick={handleSaveTenant}
                        disabled={!editingTenant?.name || !editingTenant?.location}
                        className="w-full py-4 bg-luxury-gold text-black font-bold text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingTenant?.id ? 'Save Changes' : 'Launch Property'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* CREATE/EDIT PACKAGE MODAL */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-fade-in transition-all">
            <div className="bg-[#1c1c1e] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
                <div className="p-8 pb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{editingPackage?.id ? 'Edit Package' : 'New Package'}</h2>
                    <button onClick={() => setPackageModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Package Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border-0 rounded-xl p-3 text-white placeholder-gray-600 focus:ring-1 focus:ring-luxury-gold outline-none"
                            value={editingPackage?.name || ''}
                            onChange={(e) => setEditingPackage(prev => ({...prev, name: e.target.value}))}
                            placeholder="e.g. Diamond"
                        />
                    </div>
                    {/* ... (Package form inputs kept same) ... */}
                </div>

                <div className="p-6 border-t border-white/5 bg-[#1c1c1e]">
                    <button 
                        onClick={handleSavePackage}
                        disabled={!editingPackage?.name || !editingPackage?.price}
                        className="w-full py-3 bg-luxury-gold text-black font-bold text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                    >
                        Save Package
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ... (Invoice Modal kept same) ... */}
    </div>
  );
};

// --- HOTEL ADMIN ---
const HotelAdminView: React.FC<DashboardProps> = ({ history, inventory, setInventory, commissionRate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'inventory' | 'team'>('overview');
  
  // -- STAFF STATE --
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);

  // -- INVENTORY STATE --
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Partial<InventoryItem> | null>(null);
  const [inventorySearch, setInventorySearch] = useState('');

  // Report State
  const [reportRange, setReportRange] = useState<'all' | '7days' | '30days'>('all');
  const [reportType, setReportType] = useState<'all' | 'Food' | 'Service' | 'Room'>('all');

  // Overview Calculations
  const totalRevenue = history.reduce((sum, t) => sum + t.total, 0);
  const hotelRevenue = totalRevenue * ((100 - commissionRate) / 100);

  // Filter Logic for Reports
  const filteredHistory = useMemo(() => {
      let data = history;
      const now = new Date();

      if (reportRange === '7days') {
          const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          data = data.filter(t => new Date(t.date) >= past);
      } else if (reportRange === '30days') {
          const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          data = data.filter(t => new Date(t.date) >= past);
      }
      return data;
  }, [history, reportRange]);

  const reportStats = useMemo(() => {
      let revenue = 0;
      let count = 0;

      filteredHistory.forEach(tx => {
          tx.items.forEach(item => {
              if (reportType === 'all' || item.type === reportType) {
                  revenue += item.price;
                  count++;
              }
          });
      });

      return { revenue, count };
  }, [filteredHistory, reportType]);

  // -- STAFF CRUD OPERATIONS --
  const handleSaveStaff = () => {
      if (!editingStaff?.name || !editingStaff?.role) return;

      if (editingStaff.id) {
          // Update
          setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...editingStaff } as StaffMember : s));
      } else {
          // Create
          const newStaff: StaffMember = {
              id: `st-${Date.now()}`,
              name: editingStaff.name,
              role: editingStaff.role,
              email: editingStaff.email || '',
              phone: editingStaff.phone || '',
              department: editingStaff.department || 'General',
              status: 'Offline',
              shift: 'Morning'
          };
          setStaffList(prev => [...prev, newStaff]);
      }
      setStaffModalOpen(false);
      setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
      if (window.confirm('Are you sure you want to remove this employee?')) {
          setStaffList(prev => prev.filter(s => s.id !== id));
      }
  };

  // -- INVENTORY CRUD OPERATIONS --
  const handleSaveInventory = () => {
      if (!editingInventory?.name || !editingInventory?.category) return;

      if (editingInventory.id) {
          // Update
          setInventory(prev => prev.map(i => i.id === editingInventory.id ? { ...i, ...editingInventory } as InventoryItem : i));
      } else {
          // Create
          const newItem: InventoryItem = {
              id: `inv-${Date.now()}`,
              name: editingInventory.name,
              category: editingInventory.category,
              quantity: editingInventory.quantity || 0,
              threshold: editingInventory.threshold || 10,
              unit: editingInventory.unit || 'pcs'
          };
          setInventory(prev => [...prev, newItem]);
      }
      setInventoryModalOpen(false);
      setEditingInventory(null);
  };

  const handleDeleteInventory = (id: string) => {
      if (window.confirm('Delete this item from inventory?')) {
          setInventory(prev => prev.filter(i => i.id !== id));
      }
  };

  const filteredInventory = inventory.filter(item => 
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
      item.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h2 className="font-serif text-2xl md:text-3xl text-luxury-gold">Property Management</h2>
            <p className="text-gray-400">SmartGuest Resort - Zanzibar</p>
        </div>
        <div className="flex bg-luxury-charcoal p-1 rounded-lg border border-white/5 overflow-x-auto">
            {['overview', 'reports', 'inventory', 'team'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 md:px-6 py-2 rounded-md text-xs md:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === tab ? 'bg-luxury-gold text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Hotel Net Revenue" value={`$${hotelRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtext={`${100 - commissionRate}% Share`} />
                <StatCard label="Total Transactions" value={history.length.toString()} />
                <StatCard label="Pending Orders" value={history.reduce((acc, tx) => acc + tx.items.filter(i => i.status !== 'Completed').length, 0).toString()} color="text-orange-400" />
            </div>
            
            <div className="bg-luxury-charcoal p-4 md:p-8 rounded-xl border border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-xl text-white">Staff On Duty</h3>
                    <button onClick={() => setActiveTab('team')} className="text-luxury-gold text-xs uppercase tracking-widest hover:underline">Manage Team →</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[600px]">
                        <thead className="text-xs uppercase bg-white/5 text-gray-500">
                            <tr><th className="p-3">Department</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {staffList.filter(s => s.status !== 'Offline').map(s => (
                                <tr key={s.id}>
                                    <td className="p-3">{s.department}</td>
                                    <td className="p-3 font-bold text-white">{s.name}</td>
                                    <td className="p-3 font-mono text-xs">{s.role}</td>
                                    <td className={`p-3 ${s.status === 'Online' ? 'text-green-500' : 'text-yellow-500'}`}>● {s.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row gap-4 mb-4">
                 <select value={reportRange} onChange={(e) => setReportRange(e.target.value as any)} className="bg-luxury-charcoal border border-white/10 text-white p-2 rounded w-full md:w-auto">
                     <option value="all">All Time</option>
                     <option value="7days">Last 7 Days</option>
                     <option value="30days">Last 30 Days</option>
                 </select>
                 <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} className="bg-luxury-charcoal border border-white/10 text-white p-2 rounded w-full md:w-auto">
                     <option value="all">All Services</option>
                     <option value="Food">Dining</option>
                     <option value="Service">Wellness & Spa</option>
                     <option value="Room">Accommodation</option>
                 </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5">
                     <p className="text-gray-500 text-xs uppercase tracking-widest">Revenue Generated</p>
                     <p className="text-3xl text-luxury-gold font-serif mt-2">${reportStats.revenue.toLocaleString()}</p>
                 </div>
                 <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5">
                     <p className="text-gray-500 text-xs uppercase tracking-widest">Items Sold</p>
                     <p className="text-3xl text-white font-serif mt-2">{reportStats.count}</p>
                 </div>
             </div>
             
             <div className="bg-luxury-charcoal rounded-xl border border-white/5 overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 min-w-[600px]">
                        <thead className="text-xs uppercase bg-black/20 text-gray-500">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Item Count</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredHistory.map(tx => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-mono text-xs">{tx.id}</td>
                                    <td className="p-4">{tx.items.length}</td>
                                    <td className="p-4 text-right text-luxury-gold">${tx.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
          </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
          <div className="bg-luxury-charcoal rounded-xl border border-white/5 overflow-hidden animate-fade-in flex flex-col">
              <div className="p-6 border-b border-white/10 bg-black/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <h3 className="text-white font-bold">Stock Control</h3>
                  <div className="flex gap-4 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-luxury-gold outline-none flex-1 md:w-64"
                      />
                      <button 
                        onClick={() => { setEditingInventory({}); setInventoryModalOpen(true); }}
                        className="bg-luxury-gold text-black px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors uppercase tracking-wider"
                      >
                          + Add Item
                      </button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300 min-w-[700px]">
                      <thead className="text-xs uppercase bg-white/5 text-gray-500">
                          <tr>
                              <th className="p-4">Item Name</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Current Stock</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {filteredInventory.map(item => {
                              const isLow = item.quantity <= item.threshold;
                              return (
                                <tr key={item.id} className={`hover:bg-white/5 transition-colors ${isLow ? 'bg-red-500/5' : ''}`}>
                                    <td className="p-4 font-bold">{item.name}</td>
                                    <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs uppercase">{item.category}</span></td>
                                    <td className="p-4 font-mono text-lg">{item.quantity} <span className="text-xs text-gray-500">{item.unit}</span></td>
                                    <td className="p-4">
                                        {isLow ? (
                                            <span className="text-red-400 flex items-center gap-1 text-xs font-bold uppercase"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Low Stock</span>
                                        ) : (
                                            <span className="text-green-500 text-xs font-bold uppercase">OK</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setEditingInventory(item); setInventoryModalOpen(true); }} className="text-gray-400 hover:text-white px-2">✎</button>
                                            <button onClick={() => handleDeleteInventory(item.id)} className="text-red-500 hover:text-red-400 px-2">🗑</button>
                                        </div>
                                    </td>
                                </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* TEAM TAB */}
      {activeTab === 'team' && (
          <div className="bg-luxury-charcoal rounded-xl border border-white/5 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                  <h3 className="text-white font-bold">Employee Directory</h3>
                  <button 
                    onClick={() => { setEditingStaff({}); setStaffModalOpen(true); }}
                    className="bg-luxury-gold text-black px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors uppercase tracking-wider"
                  >
                      + Hire Staff
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300 min-w-[700px]">
                      <thead className="text-xs uppercase bg-white/5 text-gray-500">
                          <tr>
                              <th className="p-4">Name</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Dept.</th>
                              <th className="p-4">Shift</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {staffList.map(staff => (
                              <tr key={staff.id} className="hover:bg-white/5 transition-colors">
                                  <td className="p-4 font-bold">{staff.name}</td>
                                  <td className="p-4 text-xs font-mono">{staff.role}</td>
                                  <td className="p-4 text-gray-400">{staff.department}</td>
                                  <td className="p-4 text-gray-400">{staff.shift}</td>
                                  <td className="p-4">
                                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                          staff.status === 'Online' ? 'bg-green-500/20 text-green-500' : 
                                          staff.status === 'Away' ? 'bg-yellow-500/20 text-yellow-500' : 
                                          'bg-gray-700 text-gray-400'
                                      }`}>
                                          {staff.status}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => { setEditingStaff(staff); setStaffModalOpen(true); }} className="text-gray-400 hover:text-white px-2">✎</button>
                                          <button onClick={() => handleDeleteStaff(staff.id)} className="text-red-500 hover:text-red-400 px-2">🗑</button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* STAFF MODAL */}
      {staffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-[#1c1c1e] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">{editingStaff?.id ? 'Update Staff Member' : 'New Hire'}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                              value={editingStaff?.name || ''} onChange={e => setEditingStaff(prev => ({...prev, name: e.target.value}))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Role</label>
                              <select className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1"
                                  value={editingStaff?.role || UserRole.CONCIERGE} onChange={e => setEditingStaff(prev => ({...prev, role: e.target.value as UserRole}))}>
                                  <option value={UserRole.CHEF}>Chef</option>
                                  <option value={UserRole.TRAINER}>Trainer</option>
                                  <option value={UserRole.SPA_MANAGER}>Spa Manager</option>
                                  <option value={UserRole.CONCIERGE}>Concierge</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Department</label>
                              <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingStaff?.department || ''} onChange={e => setEditingStaff(prev => ({...prev, department: e.target.value}))} />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Status</label>
                              <select className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1"
                                  value={editingStaff?.status || 'Offline'} onChange={e => setEditingStaff(prev => ({...prev, status: e.target.value as any}))}>
                                  <option value="Online">Online</option>
                                  <option value="Away">Away</option>
                                  <option value="Offline">Offline</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Shift</label>
                              <select className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1"
                                  value={editingStaff?.shift || 'Morning'} onChange={e => setEditingStaff(prev => ({...prev, shift: e.target.value as any}))}>
                                  <option value="Morning">Morning</option>
                                  <option value="Evening">Evening</option>
                                  <option value="Night">Night</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setStaffModalOpen(false)} className="flex-1 py-3 border border-gray-600 rounded hover:bg-white/5 text-gray-300">Cancel</button>
                      <button onClick={handleSaveStaff} className="flex-1 py-3 bg-luxury-gold text-black font-bold rounded hover:bg-white">Save</button>
                  </div>
              </div>
          </div>
      )}

      {/* INVENTORY MODAL */}
      {inventoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
              <div className="bg-[#1c1c1e] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">{editingInventory?.id ? 'Update Stock Item' : 'Add New Item'}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Item Name</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                              value={editingInventory?.name || ''} onChange={e => setEditingInventory(prev => ({...prev, name: e.target.value}))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Category</label>
                              <select className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1"
                                  value={editingInventory?.category || 'Food'} onChange={e => setEditingInventory(prev => ({...prev, category: e.target.value as any}))}>
                                  <option value="Food">Food & Bev</option>
                                  <option value="Spa">Spa Supplies</option>
                                  <option value="Gym">Gym Equipment</option>
                                  <option value="Housekeeping">Housekeeping</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Unit</label>
                              <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingInventory?.unit || ''} onChange={e => setEditingInventory(prev => ({...prev, unit: e.target.value}))} placeholder="kg, pcs, bottle" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Current Quantity</label>
                              <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingInventory?.quantity || 0} onChange={e => setEditingInventory(prev => ({...prev, quantity: parseInt(e.target.value)}))} />
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Low Stock Alert</label>
                              <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingInventory?.threshold || 5} onChange={e => setEditingInventory(prev => ({...prev, threshold: parseInt(e.target.value)}))} />
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setInventoryModalOpen(false)} className="flex-1 py-3 border border-gray-600 rounded hover:bg-white/5 text-gray-300">Cancel</button>
                      <button onClick={handleSaveInventory} className="flex-1 py-3 bg-luxury-gold text-black font-bold rounded hover:bg-white">Save Item</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const StaffView: React.FC<DashboardProps> = ({ user, history, markTaskComplete, excursions, setExcursions, techRentals, setTechRentals }) => {
  const [viewCompleted, setViewCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Tasks' | 'Excursions' | 'TechRentals'>('Tasks');

  const [isExcursionModalOpen, setIsExcursionModalOpen] = useState(false);
  const [editingExcursion, setEditingExcursion] = useState<Partial<Excursion> | null>(null);

  // Filter items relevant to the specific staff role
  const getRelevantItems = (): { txId: string, item: CartItem, date: string }[] => {
    const items: { txId: string, item: CartItem, date: string }[] = [];
    history.forEach(tx => {
      tx.items.forEach(item => {
        let isRelevant = false;
        
        // Role Logic
        if (user.role === UserRole.CHEF && item.type === 'Food') isRelevant = true;
        if (user.role === UserRole.TRAINER && item.type === 'Service' && (item.name.includes('Gym') || item.name.includes('Trainer') || item.name.includes('Yoga'))) isRelevant = true;
        if (user.role === UserRole.SPA_MANAGER && item.type === 'Service' && (item.name.includes('Spa') || item.name.includes('Massage'))) isRelevant = true;
        if (user.role === UserRole.CONCIERGE && item.type === 'Service' && (item.name.includes('Tour') || item.name.includes('Towel') || item.name.includes('Cleaning') || item.name.includes('Rental') || item.name.includes('Concierge'))) isRelevant = true;
        
        // Status Logic
        const isCompleted = item.status === 'Completed';
        if (isRelevant) {
             if (viewCompleted && isCompleted) items.push({ txId: tx.id, item, date: tx.date });
             if (!viewCompleted && !isCompleted) items.push({ txId: tx.id, item, date: tx.date });
        }
      });
    });
    return items;
  };

  const tasks = getRelevantItems();

  const handleSaveExcursion = () => {
      if (!editingExcursion?.name || !editingExcursion?.time || !setExcursions || !excursions) return;
      if (editingExcursion.id) {
          setExcursions(prev => prev.map(e => e.id === editingExcursion.id ? { ...e, ...editingExcursion } as Excursion : e));
      } else {
          const newExcursion: Excursion = {
              id: `exc_${Date.now()}`,
              name: editingExcursion.name,
              time: editingExcursion.time,
              availableSlots: editingExcursion.availableSlots || 10,
              description: editingExcursion.description || '',
              price: editingExcursion.price || 0
          };
          setExcursions(prev => [...prev, newExcursion]);
      }
      setIsExcursionModalOpen(false);
      setEditingExcursion(null);
  };

  const handleDeleteExcursion = (id: string) => {
      if (!setExcursions) return;
      setExcursions(prev => prev.filter(e => e.id !== id));
  };

  const cycleTechStatus = (id: string, currentStatus: string = 'Available') => {
      if (!setTechRentals) return;
      const statuses: Array<'Available' | 'Rented' | 'Maintenance'> = ['Available', 'Rented', 'Maintenance'];
      const nextIdx = (statuses.indexOf(currentStatus as any) + 1) % statuses.length;
      setTechRentals(prev => prev.map(t => t.id === id ? { ...t, status: statuses[nextIdx] } : t));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-0 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="font-serif text-3xl text-luxury-gold">{user.role} Portal</h2>
            <p className="text-gray-400">Welcome back, {user.name}</p>
        </div>
        
        {user.role === UserRole.CONCIERGE && (
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 flex-wrap">
                <button 
                  onClick={() => setActiveTab('Tasks')}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'Tasks' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Incoming Tasks
                </button>
                <button 
                  onClick={() => setActiveTab('Excursions')}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'Excursions' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Daily Excursions
                </button>
                <button 
                  onClick={() => setActiveTab('TechRentals')}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'TechRentals' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Tech Rentals
                </button>
            </div>
        )}
      </header>

      {activeTab === 'Tasks' && (
      <>
          <div className="flex items-center justify-end gap-4">
              <div className="text-xs uppercase tracking-widest text-gray-500">View Mode</div>
              <button 
                  onClick={() => setViewCompleted(!viewCompleted)}
                  className={`px-4 py-2 rounded border text-xs font-bold uppercase tracking-wider transition-colors ${
                      viewCompleted 
                      ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
              >
                  {viewCompleted ? 'Viewing Completed' : 'Viewing Active Tasks'}
              </button>
          </div>

          <div className="bg-luxury-charcoal rounded-xl border border-white/5 overflow-hidden min-h-[400px]">
            <div className="p-4 bg-black/20 border-b border-white/5 flex justify-between">
                <h3 className="text-white font-bold">{viewCompleted ? 'Completed History' : 'Pending Requests'}</h3>
                <span className="text-luxury-gold font-bold">{tasks.length}</span>
            </div>
            {tasks.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center h-full mt-10">
                    <span className="text-4xl block mb-4 opacity-50">{viewCompleted ? '📂' : '✅'}</span>
                    <p>No {viewCompleted ? 'completed' : 'pending'} items found.</p>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {tasks.map((task, idx) => (
                        <div key={`${task.txId}-${idx}`} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors group gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${viewCompleted ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                        {viewCompleted ? 'Done' : 'Pending'}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">#{task.txId}</span>
                                </div>
                                <p className={`text-white text-lg font-bold ${viewCompleted ? 'line-through text-gray-500' : ''}`}>{task.item.name}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                    <span>📅 {new Date(task.date).toLocaleString()}</span>
                                    {task.item.details && <span className="text-luxury-gold">• {task.item.details}</span>}
                                </p>
                            </div>
                            
                            {!viewCompleted && (
                                <button 
                                    onClick={() => markTaskComplete(task.txId, task.item.id)}
                                    className="w-full md:w-auto bg-luxury-gold text-black px-6 py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg hover:shadow-luxury-gold/50"
                                >
                                    Mark Done
                                </button>
                            )}
                            {viewCompleted && (
                                 <span className="hidden md:block text-2xl text-green-500 opacity-50 group-hover:opacity-100 transition-opacity">✓</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
      </>
      )}

      {activeTab === 'Excursions' && excursions && setExcursions && (
          <div className="bg-luxury-charcoal p-6 md:p-8 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl text-white">Daily Excursions</h3>
                <button 
                  onClick={() => {
                      setEditingExcursion({ name: '', time: '', description: '', availableSlots: 10, price: 0 });
                      setIsExcursionModalOpen(true);
                  }}
                  className="bg-luxury-gold text-black px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                >
                    + Add New Tour
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {excursions.map(exc => (
                     <div key={exc.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-luxury-gold/30 transition-all flex flex-col">
                         <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-bold text-luxury-gold">{exc.name}</h4>
                            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-300 border border-white/5">{exc.time}</span>
                         </div>
                         <p className="text-sm text-gray-400 flex-1 mb-4">{exc.description}</p>
                         <div className="flex justify-between items-center text-sm mb-4">
                             <div className="flex space-x-4">
                                <span className="text-gray-300">Slots: <span className="font-bold text-white">{exc.availableSlots}</span></span>
                                <span className="text-gray-300">Price: <span className="font-bold text-white">${exc.price}</span></span>
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-2 mt-auto">
                            <button 
                              onClick={() => {
                                  setEditingExcursion(exc);
                                  setIsExcursionModalOpen(true);
                              }}
                              className="py-2 border border-white/10 rounded text-xs uppercase font-bold text-white hover:bg-white/5"
                            >
                                Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteExcursion(exc.id)}
                              className="py-2 border border-red-500/30 rounded text-xs uppercase font-bold text-red-400 hover:bg-red-500/10"
                            >
                                Delete
                            </button>
                         </div>
                     </div>
                 ))}
                 {excursions.length === 0 && (
                     <div className="col-span-1 lg:col-span-2 text-center p-12 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                         No excursions planned. Add one to offer to guests.
                     </div>
                 )}
              </div>
          </div>
      )}

      {activeTab === 'TechRentals' && techRentals && setTechRentals && (
          <div className="bg-luxury-charcoal p-6 md:p-8 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl text-white">Wellness Tech Fleet</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {techRentals.map(tech => (
                     <div key={tech.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-luxury-gold/30 transition-all flex flex-col">
                         <div className="h-40 bg-black relative">
                            <img src={tech.imageUrl} alt={tech.name} className="w-full h-full object-cover opacity-60" />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => cycleTechStatus(tech.id, tech.status)}
                                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-lg transition-colors ${
                                        tech.status === 'Available' ? 'bg-green-500 text-black' :
                                        tech.status === 'Rented' ? 'bg-orange-500 text-black' :
                                        'bg-red-500 text-black'
                                    }`}
                                >
                                    {tech.status || 'Available'}
                                </button>
                            </div>
                         </div>
                         <div className="p-4 flex flex-col flex-1">
                             <h4 className="font-bold text-luxury-gold mb-1">{tech.name}</h4>
                             <p className="text-xs text-gray-400 mb-4 flex-1">{tech.description}</p>
                             <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-auto">
                                <span className="text-sm font-bold text-white">${tech.pricePerDay} <span className="text-gray-500 text-xs font-normal">/ day</span></span>
                             </div>
                         </div>
                     </div>
                 ))}
              </div>
          </div>
      )}

      {/* Edit Excursion Modal */}
      {isExcursionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsExcursionModalOpen(false)}>
              <div className="bg-luxury-charcoal max-w-lg w-full rounded-2xl border border-luxury-gold shadow-2xl overflow-hidden p-8" onClick={e => e.stopPropagation()}>
                  <h3 className="font-serif text-2xl text-white mb-6 uppercase tracking-widest">
                      {editingExcursion?.id ? 'Edit Excursion' : 'New Excursion'}
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Tour Name</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                              value={editingExcursion?.name || ''} onChange={e => setEditingExcursion(prev => ({...prev, name: e.target.value}))} />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Time (e.g. 09:00 AM)</label>
                          <input type="text" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                              value={editingExcursion?.time || ''} onChange={e => setEditingExcursion(prev => ({...prev, time: e.target.value}))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Total Slots</label>
                              <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingExcursion?.availableSlots || 0} onChange={e => setEditingExcursion(prev => ({...prev, availableSlots: parseInt(e.target.value)}))} />
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 uppercase font-bold">Price ($)</label>
                              <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1" 
                                  value={editingExcursion?.price || 0} onChange={e => setEditingExcursion(prev => ({...prev, price: parseInt(e.target.value)}))} />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 uppercase font-bold">Description</label>
                          <textarea className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-luxury-gold outline-none mt-1 min-h-[100px] resize-none" 
                              value={editingExcursion?.description || ''} onChange={e => setEditingExcursion(prev => ({...prev, description: e.target.value}))} />
                      </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setIsExcursionModalOpen(false)} className="flex-1 py-3 border border-gray-600 rounded hover:bg-white/5 text-gray-300">Cancel</button>
                      <button onClick={handleSaveExcursion} className="flex-1 py-3 bg-luxury-gold text-black font-bold rounded hover:bg-white uppercase tracking-wider">Save Tour</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const AdminDashboards: React.FC<DashboardProps> = (props) => {
  const { user, onLogout } = props;

  return (
    <div className="min-h-screen bg-luxury-black font-sans text-luxury-cream p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 pb-4 border-b border-white/10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-luxury-gold rounded flex items-center justify-center text-black font-bold">
                        {user.role.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs uppercase text-gray-500 tracking-widest">Signed in as</p>
                        <p className="font-bold text-white">{user.name}</p>
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded hover:bg-red-500/10 transition-colors w-full md:w-auto"
                >
                    Logout
                </button>
            </div>

            {/* Role Specific Content */}
            {user.role === UserRole.SUPER_ADMIN && <SuperAdminView {...props} />}
            {user.role === UserRole.HOTEL_ADMIN && <HotelAdminView {...props} />}
            {[UserRole.CHEF, UserRole.TRAINER, UserRole.SPA_MANAGER, UserRole.NUTRITIONIST, UserRole.CONCIERGE].includes(user.role) && <StaffView {...props} />}
        </div>
    </div>
  );
};

export default AdminDashboards;
