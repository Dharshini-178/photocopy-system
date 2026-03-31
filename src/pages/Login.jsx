import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    const role = document.getElementById("role").value;
    navigate(role === "staff" ? "/user" : "/admin");
  };

  return (
    <div className="center">
      <div className="login-card">
        <h1>Xerox Portal</h1>
        <p>College Print Management System</p>

        <label>Login As</label>
        <select id="role">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        <input placeholder="User ID / Admin ID" />
        <input type="password" placeholder="Password" />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
