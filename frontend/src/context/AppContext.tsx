import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import type { AppContextType, LocationData, User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps{
    children : ReactNode
}

export const AppProvider = ({children}:AppProviderProps)=>{
    const [user,setUser] = useState<User | null >(null);
    const [isAuth,setIsAuth] = useState(false);
    const [loading,setLoading] = useState(true);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city,setCity] = useState("Fecthing location...");

    async function fetchUser(){
        try{
            const token = localStorage.getItem("token");
            const {data} = await axios.get(`${authService}/api/auth/profile`,{
                headers : {
                    Authorization : `Bearer ${token}`,
                },
            });
            setUser(data.user);
            setIsAuth(true);

        } catch (error) {
            console.log(error);

        }finally{
            setLoading(false);
        }  
    }
    // perform side effect to fetch user data when the component mounts
    useEffect(()=>{
        fetchUser();
    },[]);  

    useEffect(() => {
        if (!navigator.geolocation) {
            setCity("Geolocation not supported");
            return alert("Allow location access to use this app");
        }

        let isMounted = true; 
        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            if (!isMounted) return;
            const { latitude, longitude } = position.coords;
            try{
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                
                if (!res.ok) throw new Error(`Server returned status: ${res.status}`);

                const data = await res.json();
                // console.log(data);
                // console.log(data.address.city || data.address.town || data.address.village || "current location");
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress:data.display_name || "current location"});
                
                setCity(data.address.city || data.address.town || data.address.village || "current location");
            
            }catch(error){
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress:"current location"
                });
                setCity("Failed to fetch location");
                console.error(error);
            }
        });
        return () =>{
            isMounted = false;
            setLoadingLocation(false);
        }
    },[]);

    return <AppContext.Provider 
            value={
                    {
                        isAuth,loading,setIsAuth,setLoading,setUser,user,location,loadingLocation,setLocation,setLoadingLocation,city,setCity
                    }
                }>{children}
            </AppContext.Provider>
}

export const useAppData = ():AppContextType =>{
    // access yje shared state from the context
    const context = useContext(AppContext);
    if(!context){
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
}