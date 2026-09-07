import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { PrivateRoute } from './PrivateRoute'
import { CallbackPage } from './pages/CallbackPage'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { TasksPage } from '../domains/task/pages/TasksPage'
import { AccountsPage } from '../domains/finance/pages/AccountsPage'
import { CategoriesPage } from '../domains/finance/pages/CategoriesPage'
import { FinanceDashboardPage } from '../domains/finance/pages/FinanceDashboardPage'
import { StatisticsPage } from '../domains/finance/pages/StatisticsPage'
import { TransactionsPage } from '../domains/finance/pages/TransactionsPage'
import { SocietyPage } from '../domains/society/pages/SocietyPage'

function guard(el: React.JSX.Element) {
  return <PrivateRoute>{el}</PrivateRoute>
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/callback', element: <CallbackPage /> },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: guard(<OverviewPage />) },
      { path: '/tasks', element: guard(<TasksPage />) },
      { path: '/finance/dashboard', element: guard(<FinanceDashboardPage />) },
      { path: '/finance/accounts', element: guard(<AccountsPage />) },
      { path: '/finance/transactions', element: guard(<TransactionsPage />) },
      { path: '/finance/categories', element: guard(<CategoriesPage />) },
      { path: '/finance/statistics', element: guard(<StatisticsPage />) },
      { path: '/society', element: guard(<SocietyPage />) },
    ],
  },
])
