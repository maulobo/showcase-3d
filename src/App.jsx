import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Departamento from "./components/departamento";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/departamento" element={<Departamento />} />
      </Routes>
    </Router>
  );
}

export default App;
