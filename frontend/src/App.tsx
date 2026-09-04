import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './shared/auth/AuthContext'
import { ThemeProvider } from './shared/theme/ThemeContext'
import { router } from './app/router'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
