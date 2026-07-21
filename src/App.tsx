import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { LayoutDashboard, Users, CheckSquare, Folder, PieChart, Settings, LogOut } from 'lucide-react';
import { KanbanBoard } from './pages/KanbanBoard';
import { ClientsList } from './pages/ClientsList';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';

function Layout({ user }: { user: User }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">AgencyPortal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">
            <CheckSquare className="w-5 h-5" /> Tasks
          </Link>
          <Link to="/clients" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">
            <Users className="w-5 h-5" /> Clients
          </Link>
          <Link to="/documents" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">
            <Folder className="w-5 h-5" /> Documents
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">
            <PieChart className="w-5 h-5" /> Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.displayName?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h2 className="text-lg font-semibold text-gray-800">Workspace</h2>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Login() {
  const [error, setError] = useState<string | null>(null);
  
  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. If you are using Safari or an incognito window, popups might be blocked. Try opening the app in a new tab.");
    }
  };
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2">AgencyPortal</h1>
        <p className="text-gray-500 mb-6 text-sm">Sign in to manage tasks and clients.</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-left">
            {error}
          </div>
        )}
        <button onClick={login} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} />}>
          <Route path="/" element={<Navigate to="/tasks" />} />
          <Route path="/tasks" element={<KanbanBoard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
