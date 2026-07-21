import { NavLink, Route, Routes } from 'react-router-dom'
import { PostsListPage } from './pages/PostsListPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { ConnectionsDashboardPage } from './pages/ConnectionsDashboardPage'

function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col items-center gap-8 px-6 py-16">
      <header className="w-full max-w-2xl space-y-4 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Acme</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A public, anonymously-editable post platform with realtime edits.
          </p>
        </div>
        <nav className="flex justify-center gap-4 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            Posts
          </NavLink>
          <NavLink
            to="/connections"
            className={({ isActive }) =>
              isActive
                ? 'font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            Connections
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PostsListPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/connections" element={<ConnectionsDashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
