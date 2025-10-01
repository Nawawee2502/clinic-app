// src/index.js
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

// Redux Setup
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";

// Router
import Router from "./router";

// CSS and Theme
import "./index.css";
import "@fontsource/prompt";
import "@fontsource/prompt/400.css";
import "@fontsource/prompt/400-italic.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: ['"Prompt"'].join(","),
  },
});

// Loading Component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>กำลังโหลด...</div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider theme={theme}>
            <Router />
          </ThemeProvider>
        </Suspense>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);