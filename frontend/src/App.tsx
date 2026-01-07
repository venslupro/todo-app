// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import { ROUTES } from '@/shared/constants';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TodoProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path="/*" element={
                <Layout>
                  <Routes>
                    <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.TODOS} replace />} />
                    <Route path={ROUTES.TODOS} element={<Todos />} />
                    <Route path={ROUTES.TEAMS} element={<Teams />} />
                    <Route path={ROUTES.PROFILE} element={<Profile />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </TodoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;