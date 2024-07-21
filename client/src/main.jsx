import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { UsernameProvider } from './contexts/UsernameContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <UsernameProvider>
                <App />
            </UsernameProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
