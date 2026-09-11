import {
  FileText,
  ShieldAlert,
  Users,
  Database,
  Trash2,
  LogOut,
  Settings,
  PieChart,
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, onLogout }) {
  const menuItems = [
    { id: 'notes', label: 'Notes & Lists', icon: FileText },
    { id: 'vault', label: 'Vault (Password)', icon: ShieldAlert },
    { id: 'contacts', label: 'My Contacts', icon: Users },
    { id: 'backup', label: 'Backup & Sync', icon: Database },
    { id: 'trash', label: 'Trash Bin', icon: Trash2 },
    { id: 'stats', label: 'Workspace Stats', icon: PieChart },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <span className="sidebar-title">Workspace</span>
          <span className="sync-badge">
            <span className="sync-dot"></span> SYNCED
          </span>
        </div>

        <nav className="nav-group">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout">
          <LogOut size={14} /> Log Out Workspace
        </button>
      </div>
    </aside>
  );
}
