import { Toaster } from 'react-hot-toast';

// Mount react-hot-toast's Toaster component centrally.
const ToasterComponent = () => {
  return <Toaster position="bottom-right" reverseOrder={false} />;
};

export default ToasterComponent;
