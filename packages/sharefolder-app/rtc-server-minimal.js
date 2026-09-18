import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
const RTCServer = () => {
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    useEffect(() => {
        // Listen for connection info from main process
        if (window.electronAPI) {
            window.electronAPI.onRTCConnectionInfo((info) => {
                console.log('Received RTC connection info:', info);
                setConnectionInfo(info);
                setStatus('Connected');
            });
        }
        else {
            setStatus('Electron API not available');
        }
    }, []);
    if (!connectionInfo) {
        return (_jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif' }, children: [_jsx("h2", { children: "RTC Server" }), _jsxs("p", { children: ["Status: ", status] }), _jsx("p", { children: "Waiting for connection info..." })] }));
    }
    return (_jsxs("div", { style: { padding: '20px', fontFamily: 'Arial, sans-serif' }, children: [_jsx("h2", { children: "RTC Server" }), _jsxs("p", { children: ["Status: ", status] }), _jsxs("div", { style: { marginTop: '20px' }, children: [_jsx("h3", { children: "Connection Details:" }), _jsxs("p", { children: [_jsx("strong", { children: "Peer ID:" }), " ", connectionInfo.peerId] }), _jsxs("p", { children: [_jsx("strong", { children: "Folder ID:" }), " ", connectionInfo.folderId] })] }), _jsxs("div", { style: { marginTop: '20px' }, children: [_jsx("h3", { children: "RTC Controls:" }), _jsx("button", { style: {
                            padding: '10px 20px',
                            margin: '5px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, onClick: () => setStatus('Starting RTC connection...'), children: "Start Connection" }), _jsx("button", { style: {
                            padding: '10px 20px',
                            margin: '5px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, onClick: () => setStatus('Stopping RTC connection...'), children: "Stop Connection" })] })] }));
};
// Render the component
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(_jsx(RTCServer, {}));
}
