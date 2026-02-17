import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { BrowserRouter } from 'react-router-dom';
import { CartContext, CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient()}>
      <CartProvider>
        <App />
      </CartProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
