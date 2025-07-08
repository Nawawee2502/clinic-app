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

// LoadingPage
import { LoadingPage } from "./components/loading-pages";

const theme = createTheme({
  typography: {
    fontFamily: ['"Prompt"'].join(","),
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingPage />} persistor={persistor}>
        <Suspense fallback={<LoadingPage />}>
          <ThemeProvider theme={theme}>
            <Router />
          </ThemeProvider>
        </Suspense>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);