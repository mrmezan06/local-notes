import Sidebar from './Sidebar';

export default function Layout({
  children,
  currentTab,
  setCurrentTab,
  onLogout,
}) {
  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={onLogout}
      />
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}
