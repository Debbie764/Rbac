import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Activity,
  User,
  FileText,
  AlertTriangle,
  GraduationCap,
  Key,
  Shield,
  Plus,
  Trash2,
  Edit,
  Lock,
  RefreshCw,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Database
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [threats, setThreats] = useState([]);
  const [userList, setUserList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({ activeAlerts: 0, lockedUsers: 0 });
  
  // Institutional & PBAC State
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // UI Modals State
  const [modal, setModal] = useState({ show: false, type: '', data: null });
  const [provisionForm, setProvisionForm] = useState({
    username: '', full_name: '', email: '', role_id: '',
    matric_number: '', staff_id: '', department_id: '', level_id: '',
    phone: '', gender: 'MALE', address: ''
  });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUserList();
    if (activeTab === 'security') fetchSecurityData();
    if (activeTab === 'logs') fetchAuditLogs();
    if (activeTab === 'academic') fetchAcademicData();
    if (activeTab === 'access') fetchRoleData();
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, levelRes, profileRes] = await Promise.all([
        axios.get(`${API_BASE}/institutional/departments`, config),
        axios.get(`${API_BASE}/institutional/levels`, config),
        axios.get(`${API_BASE}/users/profile`, config)
      ]);
      setDepartments(deptRes.data);
      setLevels(levelRes.data);
      setProfile(profileRes.data);
      setProfileLoading(false);
    } catch (err) { 
      console.error('Initial fetch failed'); 
      setProfileLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        axios.get(`${API_BASE}/institutional/courses`, config),
        axios.get(`${API_BASE}/institutional/departments`, config)
      ]);
      setCourses(cRes.data);
      setDepartments(dRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchRoleData = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/roles`, config),
        axios.get(`${API_BASE}/roles/permissions`, config)
      ]);
      setRoles(rRes.data);
      setPermissions(pRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/audit`, config);
      setAuditLogs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSecurityData = async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/security/alerts`, config),
        axios.get(`${API_BASE}/security/stats`, config)
      ]);
      setThreats(alertsRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchUserList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, config);
      setUserList(res.data);
    } catch (err) { console.error(err); }
  };

  // --- CRUD Handlers ---

  const handleInstitutionalAction = async (e) => {
    e.preventDefault();
    const { type, data } = modal;
    try {
      if (type === 'dept_create') await axios.post(`${API_BASE}/institutional/departments`, data, config);
      if (type === 'dept_edit') await axios.put(`${API_BASE}/institutional/departments/${data.id}`, data, config);
      if (type === 'course_create') await axios.post(`${API_BASE}/institutional/courses`, data, config);
      if (type === 'course_edit') await axios.put(`${API_BASE}/institutional/courses/${data.id}`, data, config);
      
      alert('Operation successful');
      setModal({ show: false, type: '', data: null });
      fetchAcademicData();
    } catch (err) { alert(err.response?.data?.error || 'Action failed'); }
  };

  const handleDelete = async (resource, id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`${API_BASE}/institutional/${resource}/${id}`, config);
      fetchAcademicData();
    } catch (err) { alert('Delete failed'); }
  };

  const handleRoleAction = async (e) => {
      e.preventDefault();
      const { type, data } = modal;
      try {
          if (type === 'role_create') await axios.post(`${API_BASE}/roles`, data, config);
          if (type === 'role_edit') await axios.put(`${API_BASE}/roles/${data.id}`, data, config);
          
          alert('Role updated');
          setModal({ show: false, type: '', data: null });
          fetchRoleData();
      } catch (err) { alert('Failed to manage role'); }
  };

  const handleProvision = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users/provision`, provisionForm, config);
      alert('User provisioned');
      setModal({ show: false, type: '', data: null });
      fetchUserList();
    } catch (err) { alert(err.response?.data?.error || 'Provisioning failed'); }
  };

  const SidebarItem = ({ id, icon: Icon, label, permission }) => {
    const permissions = user.permissions || [];
    const hasAccess = user.role === 'ADMIN' || 
                      (permission && permissions.includes(permission)) ||
                      ['overview', 'profile'].includes(id);
    if (!hasAccess) return null;
    return (
      <motion.div whileHover={{ x: 5 }} onClick={() => setActiveTab(id)}
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 20px', margin: '8px 0', borderRadius: '12px', cursor: 'pointer',
          background: activeTab === id ? 'linear-gradient(90deg, var(--primary), transparent)' : 'transparent',
          color: activeTab === id ? 'white' : 'var(--text-muted)',
          borderLeft: activeTab === id ? '4px solid var(--primary)' : '4px solid transparent'
        }}
      >
        <Icon size={20} style={{ marginRight: '12px' }} />
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</span>
      </motion.div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: 'var(--text-main)' }}>
      
      {/* Global Modal System */}
      <AnimatePresence>
        {modal.show && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass" style={{ width: '550px', padding: '40px', background: 'white', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              
              {/* Department Form */}
              {(modal.type === 'dept_create' || modal.type === 'dept_edit') && (
                <form onSubmit={handleInstitutionalAction}>
                  <h2 style={{ marginBottom: '25px' }} className="gradient-text">{modal.type.includes('create') ? 'Add Department' : 'Edit Department'}</h2>
                  <input type="text" placeholder="Dept Name (e.g. Computer Science)" required value={modal.data?.name || ''} onChange={e => setModal({...modal, data: {...modal.data, name: e.target.value}})} />
                  <input type="text" placeholder="Code (e.g. CSC)" required value={modal.data?.code || ''} onChange={e => setModal({...modal, data: {...modal.data, code: e.target.value}})} />
                  <textarea placeholder="Description" value={modal.data?.description || ''} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1.5px solid var(--border-light)', borderRadius: '12px' }} onChange={e => setModal({...modal, data: {...modal.data, description: e.target.value}})} />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }}>SAVE CHANGES</button>
                    <button type="button" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={() => setModal({ show: false })}>CANCEL</button>
                  </div>
                </form>
              )}

              {/* Course Form */}
              {(modal.type === 'course_create' || modal.type === 'course_edit') && (
                <form onSubmit={handleInstitutionalAction}>
                  <h2 style={{ marginBottom: '25px' }} className="gradient-text">{modal.type.includes('create') ? 'Create Course' : 'Edit Course'}</h2>
                  <input type="text" placeholder="Course Title" required value={modal.data?.name || ''} onChange={e => setModal({...modal, data: {...modal.data, name: e.target.value}})} />
                  <input type="text" placeholder="Course Code (e.g. COM111)" required value={modal.data?.code || ''} onChange={e => setModal({...modal, data: {...modal.data, code: e.target.value}})} />
                  <select required value={modal.data?.department_id || ''} style={{ width: '100%', padding: '12px', background: 'white', marginTop: '10px', borderRadius: '12px' }} onChange={e => setModal({...modal, data: {...modal.data, department_id: e.target.value}})}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select required value={modal.data?.level_id || ''} style={{ width: '100%', padding: '12px', background: 'white', marginTop: '10px', borderRadius: '12px' }} onChange={e => setModal({...modal, data: {...modal.data, level_id: e.target.value}})}>
                      <option value="">Select Level</option>
                      {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }}>DEPLOY COURSE</button>
                    <button type="button" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={() => setModal({ show: false })}>CANCEL</button>
                  </div>
                </form>
              )}

              {/* Role Form */}
              {(modal.type === 'role_create' || modal.type === 'role_edit') && (
                <form onSubmit={handleRoleAction}>
                  <h2 style={{ marginBottom: '20px' }} className="gradient-text">{modal.type.includes('create') ? 'New Authority Role' : 'Edit Role'}</h2>
                  <input type="text" placeholder="Role Name (e.g. DEAN)" required value={modal.data?.name || ''} onChange={e => setModal({...modal, data: {...modal.data, name: e.target.value}})} />
                  <textarea placeholder="Role Description" value={modal.data?.description || ''} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border-light)', marginTop: '10px' }} onChange={e => setModal({...modal, data: {...modal.data, description: e.target.value}})} />
                  
                  <div style={{ marginTop: '20px' }}>
                    <p className="section-label" style={{ fontSize: '0.75rem' }}>Assign Permissions</p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      {permissions.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                          <input 
                            type="checkbox" 
                            style={{ width: 'auto', marginBottom: 0 }} 
                            checked={modal.data?.permissionIds?.includes(p.id)}
                            onChange={(e) => {
                              const currentIds = modal.data?.permissionIds || [];
                              const newIds = e.target.checked 
                                ? [...currentIds, p.id]
                                : currentIds.filter(id => id !== p.id);
                              setModal({...modal, data: {...modal.data, permissionIds: newIds}});
                            }}
                          />
                          <label style={{ fontSize: '0.85rem' }}>{p.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }}>SAVE ROLE</button>
                    <button type="button" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={() => setModal({ show: false })}>CANCEL</button>
                  </div>
                </form>
              )}

              {/* Provisioning Form */}
              {modal.type === 'provision' && (
                <form onSubmit={handleProvision}>
                  <h2 style={{ marginBottom: '25px' }} className="gradient-text">Provision Identity</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" placeholder="Username" required onChange={e => setProvisionForm({...provisionForm, username: e.target.value})} />
                    <input type="text" placeholder="Full Name" required onChange={e => setProvisionForm({...provisionForm, full_name: e.target.value})} />
                    <input type="email" placeholder="Email" required onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} />
                    <select required onChange={e => setProvisionForm({...provisionForm, role_id: e.target.value})}>
                      <option value="">Role</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <select onChange={e => setProvisionForm({...provisionForm, department_id: e.target.value})}>
                      <option value="">Dept</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select onChange={e => setProvisionForm({...provisionForm, level_id: e.target.value})}>
                      <option value="">Level</option>
                      {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <input type="text" placeholder="ID (Matric/Staff)" onChange={e => setProvisionForm({...provisionForm, matric_number: e.target.value, staff_id: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                    <button type="submit" className="primary" style={{ flex: 1 }}>PROVISION IDENTITY</button>
                    <button type="button" style={{ flex: 1, background: '#f1f5f9', color: '#64748b' }} onClick={() => setModal({ show: false })}>CANCEL</button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="glass" style={{ width: '280px', height: '100vh', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, borderRadius: 0, background: 'white', borderRight: '1.5px solid var(--border-light)', boxShadow: '4px 0 20px rgba(0,0,0,0.02)' }}>
        <div style={{ marginBottom: '40px', padding: '0 10px' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '800' }}>KOGI POLY</h2>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>IAM PORTAL CORE</p>
        </div>
        
        <div style={{ flex: 1 }}>
          <p className="section-label" style={{ fontSize: '0.6rem', paddingLeft: '20px', color: '#94a3b8' }}>Governance</p>
          <SidebarItem id="overview" icon={ShieldCheck} label="System Pulse" />
          <SidebarItem id="academic" icon={GraduationCap} label="Academic Units" permission="MANAGE_ACADEMIC" />
          <SidebarItem id="access" icon={Lock} label="Access Control" permission="MANAGE_ROLES" />
          <SidebarItem id="security" icon={AlertTriangle} label="Security Shield" permission="MANAGE_SECURITY" />
          <SidebarItem id="users" icon={Users} label="Identity Directory" permission="MANAGE_USERS" />
          
          <p className="section-label" style={{ fontSize: '0.6rem', paddingLeft: '20px', marginTop: '30px', color: '#94a3b8' }}>Personal</p>
          <SidebarItem id="profile" icon={User} label="My Profile" />
        </div>

        <button onClick={onLogout} style={{ marginTop: 'auto', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LogOut size={18} style={{ marginRight: '10px' }} /> Terminate Session
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Identity Governance</h1>
            <p style={{ color: 'var(--text-muted)' }}>Security Level: <span style={{ color: '#16a34a', fontWeight: '700' }}>OPERATIONAL</span> | User: {user.full_name}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="glass" style={{ padding: '15px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', background: 'white' }}>
                <Activity size={20} color={stats.activeAlerts > 0 ? "#ef4444" : "#16a34a"} style={{ marginRight: '12px' }} />
                <span style={{ fontWeight: '700' }}>{stats.activeAlerts > 0 ? 'CRITICAL' : 'SECURE'}</span>
            </div>
          </div>
        </header>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
               <div className="glass" style={{ padding: '30px', background: 'white' }}>
                  <Users color="var(--primary)" size={24} />
                  <h3 style={{ marginTop: '15px' }}>{userList.length}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Identities</p>
               </div>
               <div className="glass" style={{ padding: '30px', background: 'white' }}>
                  <Building2 color="var(--primary)" size={24} />
                  <h3 style={{ marginTop: '15px' }}>{departments.length}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Departments</p>
               </div>
               <div className="glass" style={{ padding: '30px', background: 'white' }}>
                  <Lock color="var(--primary)" size={24} />
                  <h3 style={{ marginTop: '15px' }}>{roles.length}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Authority Roles</p>
               </div>
               <div className="glass" style={{ padding: '30px', background: 'white' }}>
                  <AlertTriangle color={stats.activeAlerts > 0 ? '#ef4444' : 'var(--primary)'} size={24} />
                  <h3 style={{ marginTop: '15px' }}>{stats.activeAlerts}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Open Incidents</p>
               </div>
            </div>
          )}

          {activeTab === 'academic' && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                {/* Department Management */}
                <div className="glass" style={{ padding: '30px', background: 'white' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <h3 style={{ fontWeight: '800' }}>Departments</h3>
                      <Plus size={20} className="clickable" onClick={() => setModal({ show: true, type: 'dept_create', data: {} })} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {departments.map(d => (
                         <div key={d.id} className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                               <p style={{ fontWeight: '800' }}>{d.name}</p>
                               <div style={{ display: 'flex', gap: '10px' }}>
                                  <Edit size={14} className="clickable" onClick={() => setModal({ show: true, type: 'dept_edit', data: d })} />
                                  <Trash2 size={14} className="clickable text-danger" onClick={() => handleDelete('departments', d.id)} />
                               </div>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>Code: {d.code}</p>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Course Management */}
                <div className="glass" style={{ padding: '30px', background: 'white' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <h3 style={{ fontWeight: '800' }}>Academic Courses</h3>
                      <button className="primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setModal({ show: true, type: 'course_create', data: {} })}>New Course</button>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {courses.map(c => (
                         <div key={c.id} className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                               <p style={{ fontWeight: '800', fontSize: '0.9rem' }}>{c.code}</p>
                               <div style={{ display: 'flex', gap: '10px' }}>
                                  <Edit size={14} className="clickable" onClick={() => setModal({ show: true, type: 'course_edit', data: c })} />
                                  <Trash2 size={14} className="clickable text-danger" onClick={() => handleDelete('courses', c.id)} />
                               </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '5px' }}>{c.name}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '10px' }}>{c.department_name} | {c.level_name}</p>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'access' && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                <div className="glass" style={{ padding: '30px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: '800' }}>System Roles</h3>
                        <Plus size={20} className="clickable" onClick={() => setModal({ show: true, type: 'role_create', data: {} })} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {roles.map(r => (
                            <div key={r.id} className="glass" style={{ padding: '20px', background: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p style={{ fontWeight: '800', color: 'var(--primary)' }}>{r.name}</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Edit size={14} className="clickable" onClick={async () => {
                                            const res = await axios.get(`${API_BASE}/roles/${r.id}/permissions`, config);
                                            const pIds = res.data.map(p => p.id);
                                            setModal({ show: true, type: 'role_edit', data: { ...r, permissionIds: pIds } });
                                        }} />
                                        <Trash2 size={14} className="clickable text-danger" onClick={() => {
                                            if(window.confirm('Delete this role?')) {
                                                axios.delete(`${API_BASE}/roles/${r.id}`, config).then(() => fetchRoleData());
                                            }
                                        }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>{r.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass" style={{ padding: '30px', background: 'white' }}>
                    <h3 style={{ fontWeight: '800', marginBottom: '25px' }}>Global Permissions Matrix</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {permissions.map(p => (
                            <div key={p.id} className="glass" style={{ padding: '15px', border: '1px solid var(--border-light)', background: '#f8fafc' }}>
                                <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{p.name}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'security' && (
             <div className="glass" style={{ padding: '40px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <h2 style={{ fontWeight: '800', display: 'flex', alignItems: 'center' }}>
                    <AlertTriangle size={30} style={{ marginRight: '15px', color: '#ef4444' }} /> Security Response Center
                  </h2>
                  <button className="primary" onClick={fetchSecurityData}><RefreshCw size={16} style={{ marginRight: '8px' }} /> Refresh Shield</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                   <div className="glass" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', border: 'none' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>ACTIVE ALERTS</p>
                      <h1 style={{ fontSize: '5rem', fontWeight: '800', color: stats.activeAlerts > 0 ? '#ef4444' : 'var(--text-main)' }}>{stats.activeAlerts}</h1>
                      <div style={{ padding: '15px', background: 'white', borderRadius: '15px', marginTop: '20px', display: 'inline-flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <Lock size={18} style={{ marginRight: '10px', color: '#f59e0b' }} /> {stats.lockedUsers} Accounts Locked
                      </div>
                   </div>
                   <div>
                      <h4 style={{ marginBottom: '20px', fontWeight: '800' }}>Recent Intelligence</h4>
                      {threats.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No threats detected.</p> : (
                        threats.map(t => (
                          <div key={t.id} style={{ padding: '20px', background: '#f8fafc', borderLeft: '4px solid #ef4444', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                             <div>
                                <p style={{ fontWeight: '800' }}>{t.type.replace(/_/g, ' ')}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>User: {t.username || 'Anon'} | IP: {t.ip_address}</p>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.timestamp).toLocaleTimeString()}</p>
                                <button style={{ marginTop: '8px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }} onClick={async () => {
                                    await axios.patch(`${API_BASE}/security/alerts/${t.id}/resolve`, {}, config);
                                    fetchSecurityData();
                                }}>RESOLVE</button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'users' && (
             <div className="glass" style={{ padding: '35px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                  <h2 style={{ fontWeight: '800' }}>Identity Directory</h2>
                  <button className="primary" onClick={() => setModal({ show: true, type: 'provision', data: provisionForm })}>+ Provision Identity</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <th style={{ padding: '15px' }}>IDENTITY</th>
                        <th style={{ padding: '15px' }}>DEPARTMENT</th>
                        <th style={{ padding: '15px' }}>AUTHORITY</th>
                        <th style={{ padding: '15px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map(u => (
                        <tr key={u.id} style={{ background: '#f8fafc' }}>
                          <td style={{ padding: '15px', borderRadius: '15px 0 0 15px' }}>
                             <p style={{ fontWeight: '700' }}>{u.full_name}</p>
                             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</p>
                          </td>
                          <td style={{ padding: '15px' }}>{u.department_name || 'System Registry'}</td>
                          <td style={{ padding: '15px' }}><span style={{ color: 'var(--primary)', fontWeight: '800' }}>{u.role_name}</span></td>
                          <td style={{ padding: '15px', borderRadius: '0 15px 15px 0' }}>
                             <span style={{ 
                                background: u.is_active ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                color: u.is_active ? '#16a34a' : '#ef4444', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '0.7rem', 
                                fontWeight: '700' 
                             }}>
                                {u.is_active ? 'ACTIVE' : 'LOCKED'}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
             </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass" style={{ padding: '40px', background: 'white' }}>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <div style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '30px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <User size={60} />
                  </div>
                  <h3 style={{ fontWeight: '800' }}>{user.full_name}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', marginTop: '5px' }}>{user.role}</p>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontWeight: '800', marginBottom: '30px' }} className="gradient-text">Identity Profile</h2>
                  
                  {profileLoading ? <p>Loading profile intelligence...</p> : profile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Institutional Email</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.email}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Username</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>@{profile.username}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Department</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.department_name || 'General Administration'}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Identity ID (Staff/Matric)</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.staff_id || profile.matric_number || 'N/A'}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Contact Phone</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.phone || 'Not Provided'}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Gender</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.gender}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none', gridColumn: 'span 2' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Residential Address</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{profile.address || 'No address on record'}</p>
                      </div>
                      <div className="glass" style={{ padding: '20px', background: '#f8fafc', border: 'none', gridColumn: 'span 2' }}>
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Account Created</p>
                        <p style={{ fontWeight: '700', marginTop: '5px' }}>{new Date(profile.created_at).toLocaleDateString()} {new Date(profile.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ) : <p>Failed to retrieve profile.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="glass" style={{ padding: '35px', background: 'white' }}>
               <h2 style={{ fontWeight: '800', marginBottom: '30px' }}>Audit Stream</h2>
               {auditLogs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No audit events found.</p> : (
                 auditLogs.map(l => (
                   <div key={l.id} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <FileText size={20} color="var(--primary)" />
                      <div>
                         <p style={{ fontWeight: '700' }}>{l.action} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>on {l.resource}</span></p>
                         <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.details} | By: {l.username || 'System'}</p>
                      </div>
                      <p style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</p>
                   </div>
                 ))
               )}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
;
