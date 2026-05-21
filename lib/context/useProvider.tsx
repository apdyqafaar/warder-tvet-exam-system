'use client'

import { createContext, useContext } from "react";
import { IUser } from "../types/schema-types";

export const UserContext = createContext<IUser | null>(null);
export const UserProvider=({children, user}: {children: React.ReactNode, user: IUser})=>{
    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}
export const useUser=()=>{
    const user = useContext(UserContext);
    if(!user){
        throw new Error("useUser must be used within a UserProvider");
    }
    return user;
}
