import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SelectRole from "./pages/SelectRole";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRouter";
import PublicRoute from "./components/publicRouter";
import Navbar from "./components/navbar";
import Account from "./pages/Account";

const App = () => {
  return (
    <>
      <BrowserRouter>
      <Navbar />
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
