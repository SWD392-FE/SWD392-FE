import { useState } from 'react';
import FaceLogin from './components/FaceLogin';
import POSSystem from './components/POSSystem';
import { UserAccount } from './lib/data';

function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <>
      {!currentUser ? (
        <FaceLogin onLogin={handleLogin} />
      ) : (
        <POSSystem user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
