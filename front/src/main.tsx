"use client";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import ChakraProvider from "@/providers/ChakraProvider";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { LoadingProvider } from "@/providers/LoadingProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <Auth0Provider
      domain={process.env.AUTH0_DOMAIN}
      clientId={process.env.CLIENT_ID}
      authorizationParams={{
        redirect_uri: process.env.REDIRECT_URL,
      }}
    > */}
    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
    {/* </Auth0Provider> */}
  </StrictMode>
);
