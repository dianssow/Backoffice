import {configureStore} from  "@reduxjs/toolkit"
 import loginPageReducer from "./feature/loginPage"

export const store = configureStore({
    reducer: {
        loginPage: loginPageReducer,
        // vente: venteReducer,

    },
})