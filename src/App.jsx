import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './features/auth/AuthScreen';
import Layout from './components/Layout';
import NotesModule from './features/notes/NotesModule';
import VaultModule from './features/vault/VaultModule';
import ContactsModule from './features/contacts/ContactsModule';
import BackupModule from './features/backup/BackupModule';
import TrashModule from './features/trash/TrashModule';
import SettingsModule from './features/settings/SettingsModule';
import StatsModule from './features/stats/StatsModule';

function AppContent() {
  const { user, loading, logout, lockVaultInstantly } = useAuth();
  const [currentTab, setCurrentTab] = useState('notes');

  // Requirement: Auto-lock vault memory data arrays when switching tabs [INDEX]
  useEffect(() => {
    if (currentTab !== 'vault') {
      lockVaultInstantly();
    }
  }, [currentTab, lockVaultInstantly]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}
      >
        Initializing database encryption layers...
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      onLogout={logout}
    >
      {currentTab === 'notes' && <NotesModule />}
      {currentTab === 'vault' && <VaultModule />}
      {currentTab === 'contacts' && <ContactsModule />}
      {currentTab === 'backup' && <BackupModule />}
      {currentTab === 'trash' && <TrashModule />}
      {currentTab === 'settings' && <SettingsModule />}
      {currentTab === 'stats' && <StatsModule />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
