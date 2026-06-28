import React from "react"
import type { Metadata } from "next"
import "../index.css"

export const metadata: Metadata = {
  title: "REST API Client",
  description: "A premium, power-user Postman clone client",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
