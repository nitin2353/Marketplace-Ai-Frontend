import { Toaster } from 'react-hot-toast';

// Mount react-hot-toast's Toaster component centrally.
const ToasterComponent = () => {
  return (
    <Toaster 
      position="bottom-right" 
      reverseOrder={false} 
      toastOptions={{
        style: {
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--danger)',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToasterComponent;
