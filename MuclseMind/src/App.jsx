import { Suspense, lazy } from 'react';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import routes from './routes';
import Login from './components/login';
import CreateAccount from './components/CreateAccount';

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
        <Route
          path="/"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <Login/>
            </Suspense>
          }
        />
         <Route
          path="/create-account"
          element={
            <Suspense fallback={<div>Loading...</div>}>
            <CreateAccount/>
            </Suspense>
          }
        />
        <Route element={<DefaultLayout />}>
          {routes
            .filter(route => route.path !== '/')
            .map((route, index) => {
              const { path, component: Component } = route;
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Component />
                    </Suspense>
                  }
                />
              );
            })}
        </Route>
      </Routes>
    </>
  );
}

export default App;
