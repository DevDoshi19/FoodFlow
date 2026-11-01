//outlet is used to render the child routes of the current route. Navigate is used to redirect the user to a different route.
import {Navigate,Outlet} from 'react-router-dom';
import { useAppData } from '../context/AppContext';

const PublicRoute = () => {

    const {isAuth,loading} = useAppData();

    if(loading) return null ;

    return isAuth? <Navigate to="/" replace/>:<Outlet />

}

export default PublicRoute;