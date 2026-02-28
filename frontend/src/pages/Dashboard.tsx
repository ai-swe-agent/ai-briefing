import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                AI Briefing
              </h1>
            </div>
            <div className="flex items-center">
              <Button onClick={logout} variant="secondary">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Welcome to your dashboard</p>
          </div>
        </div>
      </main>
    </div>
  );
}
