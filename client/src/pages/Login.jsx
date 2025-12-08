import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto card mt-8">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-brand text-white py-2 rounded">
          Sign in
        </button>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = "http://localhost:3001/api/auth/google-login"}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 hover:border-gray-400 transition-colors text-gray-700 font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 488 512" fill="none">
            <g>
              <path fill="#4285F4" d="M488 261.8c0-17.8-1.5-35-4.3-51.8H249v98h136.5c-5.6 30-22.2 55.5-47.5 72.5v60h76.8c45-41.4 71-102.7 71-178.7z"/>
              <path fill="#34A853" d="M249 492c64.8 0 119.3-21.5 159.1-58.4l-76.8-60.1c-21.3 14.3-48.3 22.7-82.3 22.7-63.2 0-116.7-42.7-135.8-100.4h-80.3v63.5C72.5 441.8 154.3 492 249 492z"/>
              <path fill="#FBBC05" d="M113.2 295.8c-8.4-24.6-8.4-51 0-75.6v-63.5h-80.3C7.6 196.6 0 222.6 0 249s7.6 52.4 32.9 92.4l80.3-63.6z"/>
              <path fill="#EA4335" d="M249 97.8c35.1 0 66.5 12.1 91.2 35.9l68.7-68.7C368.3 30.5 313.8 8 249 8 154.3 8 72.5 58.2 32.9 155.6l80.3 63.5C132.3 140.5 185.8 97.8 249 97.8z"/>
            </g>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="text-sm text-gray-600">
          New here? <Link to="/register">Create account</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;

