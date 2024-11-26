import { atom } from "recoil";



export const userBalanceAtom = atom({
    key:"useBalanceAtom",
    default:0
})

    export const isAuthenticated = atom ({
        key:"isAuthenticatedAtom",
    
        default:localStorage.getItem("token") ? true: false
    })