import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import routes from './routes';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        {/* Public Routes */}
        {routes
          .filter(route => ['/', '/create-account', '/forgot-password'].includes(route.path))
          .map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <Component />
                </Suspense>
              }
            />
          ))}

        {/* Protected Routes with DefaultLayout */}
        <Route element={<DefaultLayout />}>
          {routes
            .filter(route => !['/', '/create-account', '/forgot-password'].includes(route.path))
            .map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
        </Route>

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="flex h-screen items-center justify-center">
              <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
