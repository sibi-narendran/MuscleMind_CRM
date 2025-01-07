import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import routes from './routes';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const LoadingAnimation = () => (
    <div className="flex h-screen items-center justify-center">
      <DotLottieReact
        src="https://lottie.host/96a56ec3-d253-4f61-890d-c11896653ee9/6ozXHhfQG6.lottie"
        loop
        autoplay
        style={{ width: '100px', height: '100px' }}
      />
    </div>
  );

  return (
    <>
      {/* ram */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <Routes>
        {/* Public Routes */}
        {routes
          .filter(route => ['/','/login', '/create-account', '/forgot-password'].includes(route.path))
          .map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<LoadingAnimation />}>
                  <Component />
                </Suspense>
              }
            />
          ))}

        {/* Protected Routes with DefaultLayout */}
        <Route element={<DefaultLayout />}>
          {routes
            .filter(route => !['/login','/', '/create-account', '/forgot-password'].includes(route.path))
            .map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<LoadingAnimation />}>
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
