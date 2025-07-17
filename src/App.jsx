import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import DepartamentoAdaptive from "./components/DepartamentoAdaptive";
import EdificioAdaptive from "./components/EdificioAdaptive";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/departamento" element={<DepartamentoAdaptive />} />
        <Route path="/edificio" element={<EdificioAdaptive />} />
      </Routes>
    </Router>
  );
}

export default App;
