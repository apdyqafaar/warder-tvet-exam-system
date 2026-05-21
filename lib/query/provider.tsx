"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "./client"

export const QueryProvider = ({children}:Readonly<{
    children:React.ReactNode
}>) =>{
    const client = getQueryClient()
    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    )
}