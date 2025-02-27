// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import Login from './pages/Login';


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();









import React, { Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

// Redux Setup
import { Provider, useDispatch, useSelector,init } from "react-redux";
import { store, persistor } from "./store";
import { useNavigate } from "react-router-dom";

// Router
import Routes from "./router";

// CSS
import "./index.css";
import "@fontsource/prompt";
import "@fontsource/prompt/400.css";
import "@fontsource/prompt/400-italic.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// LoadingPage
import { LoadingPage } from "./components/loading-pages";
import { PersistGate } from "redux-persist/integration/react";

import Layout from "./layouts/Layout";

const theme = createTheme({
  typography: {
    fontFamily: ['"Prompt"'].join(","),
  },
});

const App = () => {
  const token = useSelector((state) => state.authentication.token);
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('----------isAuth----- Dashboard');
    console.log(token);
    if (token) {
      setIsAuthenticated(true);
      console.log('----------isAuthentication-----' + isAuthenticated);
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  return (
    <Suspense fallback={<LoadingPage />}>
      <ThemeProvider theme={theme}>
        {isAuthenticated ? <Routes /> : <Layout />}
      </ThemeProvider>
    </Suspense>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* <Init></Init> */}
      <Suspense fallback={<LoadingPage />}>
        <ThemeProvider theme={theme}>
        
          {/* {isAuthentication ? (
                <Routes />
          ) : (
           <Layout/>
          )} */}
          <Routes />
        </ThemeProvider>
      </Suspense>
    </PersistGate>
  </Provider>
);
