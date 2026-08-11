import { AppRouter } from '@/routes/AppRouter';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';

function App() {
  return (
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  );
}

export default App;
