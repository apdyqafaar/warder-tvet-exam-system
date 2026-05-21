import { QueryClient } from "@tanstack/react-query";

const makeQUeryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            },
            mutations:{
                retry: 1,
            }
        },
    })
}

let browserQueryClient:QueryClient | undefined

export const getQueryClient = () => {
    if (typeof window==="undefined") {
        return makeQUeryClient()
    }else {
        if (!browserQueryClient) {
            browserQueryClient = makeQUeryClient()
        }
        return browserQueryClient
    }

}