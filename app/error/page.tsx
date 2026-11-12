// /app/error/page.tsx
const ErrorPage = () => {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1> 
          <p className="text-white">You do not have permission to view this page.</p> 
        </div>
      </div>
    );
  };
  
  export default ErrorPage;
  