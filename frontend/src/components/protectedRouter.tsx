import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
    const {user,isAuth,loading} = useAppData();
    const location = useLocation();

    if(loading) return null ;

    if(!isAuth) {
        return <Navigate to={"/login"} replace/>;
    }
    if(user?.role === null && location.pathname !== "/select-role"){
        return <Navigate to={"/select-role"} replace/>;
    }
    if(user?.role !== null && location.pathname === "/select-role"){
        return <Navigate to={"/"} replace/>;
    }
    if(user?.role === "seller" && location.pathname !== "/restaurant"){
        return <Navigate to={"/restaurant"} replace/>;
    }
    if (location.pathname === "/restaurant" && user?.role !== "seller") {
        return <Navigate to="/" replace />;
    }


    return <Outlet /> // childern 
}

export default ProtectedRoute;