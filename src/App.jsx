import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Departamento from "./components/departamento";
import Edificio from "./components/edificio";
import "./App.css";
import Edf from "./components/Edf";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/departamento" element={<Departamento />} />
        <Route path="/edificio" element={<Edificio />} />
        <Route path="/edf" element={<Edf />} />
      </Routes>
    </Router>
  );
}

export default App;
