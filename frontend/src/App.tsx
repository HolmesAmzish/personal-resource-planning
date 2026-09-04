import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './shared/auth/AuthContext'
import { ThemeProvider } from './shared/theme/ThemeContext'
import { LanguageProvider } from './shared/i18n/LanguageContext'
import { TranslationProvider } from './shared/i18n/TranslationContext'
import { router } from './app/router'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <TranslationProvider>
            <RouterProvider router={router} />
          </TranslationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
