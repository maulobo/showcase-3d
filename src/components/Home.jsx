import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div style={{ marginTop: "2rem" }}>
        <Link
          to="/departamento"
          style={{
            padding: "1rem 2rem",
            backgroundColor: "#646cff",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
          }}
        >
          Ver Departamento 3D
        </Link>
      </div>
    </div>
  );
}

export default Home;
