"use client"

import React from "react"
import dynamic from "next/dynamic"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Initialize TanStack query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Dynamically import the AppLayout component with SSR disabled
const AppLayout = dynamic(
  () => import("./layouts/AppLayout").then((mod) => mod.AppLayout),
  { ssr: false }
)

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
    </QueryClientProvider>
  )
}
