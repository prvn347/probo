import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Header } from "./components/Header";
import AuthPage from "./components/Auth";
import { RecoilRoot } from "recoil";
import { Home } from "./pages/Home";

function App() {
  return (
    <div className="">
      <RecoilRoot>
      <BrowserRouter>
      <Header />
        <Routes>
          <Route path="/" element={<Landing/>}  />
          <Route path="/login" element={ <AuthPage/> }  />
          <Route path="/home" element = { <Home/> }/>
        </Routes>
      </BrowserRouter></RecoilRoot>
    </div>
  );
}
export default App;
