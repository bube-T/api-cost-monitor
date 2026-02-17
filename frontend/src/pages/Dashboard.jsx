import { DollarSign, TrendingUp, AlertTriangle, Activity } from 'lucide-react'

export default function Dashboard() {
  // Temporary mock data
  const stats = [
    {
      name: 'Total Spend Today',
      value: '£127.50',
      change: '+12.5%',
      icon: DollarSign,
      color: 'blue'
    },
    {
      name: 'API Requests',
      value: '15,234',
      change: '+8.2%',
      icon: Activity,
      color: 'green'
    },
    {
      name: 'Average Cost/Request',
      value: '£0.0084',
      change: '-2.1%',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      name: 'Active Alerts',
      value: '3',
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'red'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">API Cost Monitor</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Dashboard</button>
              <button className="text-gray-600 hover:text-gray-900">APIs</button>
              <button className="text-gray-600 hover:text-gray-900">Alerts</button>
              <button className="text-gray-600 hover:text-gray-900">Settings</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your API usage and costs in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.change.startsWith('+') ? 'text-green-600' :
                      stat.change.startsWith('-') ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Over Time</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">Chart coming soon...</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Service</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500">Chart coming soon...</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent API Calls</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">OpenAI GPT-4 Request</p>
                    <p className="text-sm text-gray-600">2 minutes ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">£0.032</p>
                    <p className="text-sm text-gray-600">1,245 tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
