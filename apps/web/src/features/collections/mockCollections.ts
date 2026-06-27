import { Tab } from "@/store/tabStore"

export interface CollectionItem {
  id: string
  name: string
  method?: string
  url?: string
  children?: CollectionItem[]
}

export interface Collection {
  id: string
  name: string
  description?: string
  items: CollectionItem[]
}

export const mockCollections: Collection[] = [
  {
    id: "col-auth",
    name: "Auth Service",
    description: "Authentication and token lifecycle endpoints",
    items: [
      {
        id: "auth-login",
        name: "Login User",
        method: "POST",
        url: "https://api.example.com/v1/auth/login",
      },
      {
        id: "auth-refresh",
        name: "Refresh Access Token",
        method: "POST",
        url: "https://api.example.com/v1/auth/refresh",
      },
      {
        id: "auth-me",
        name: "Get Current User Profile",
        method: "GET",
        url: "https://api.example.com/v1/auth/me",
      },
    ],
  },
  {
    id: "col-users",
    name: "Users API",
    description: "User profile management operations",
    items: [
      {
        id: "users-list",
        name: "List Paginated Users",
        method: "GET",
        url: "https://api.example.com/v1/users?page=1&limit=20",
      },
      {
        id: "users-get",
        name: "Retrieve User details",
        method: "GET",
        url: "https://api.example.com/v1/users/usr_99812",
      },
      {
        id: "users-update",
        name: "Update User details",
        method: "PATCH",
        url: "https://api.example.com/v1/users/usr_99812",
      },
      {
        id: "users-delete",
        name: "Remove User account",
        method: "DELETE",
        url: "https://api.example.com/v1/users/usr_99812",
      },
    ],
  },
  {
    id: "col-billing",
    name: "Billing & Subscriptions",
    description: "Stripe invoice syncing and payment gateways",
    items: [
      {
        id: "billing-invoices",
        name: "Fetch Client Invoices",
        method: "GET",
        url: "https://api.example.com/v1/billing/invoices",
      },
      {
        id: "billing-checkout",
        name: "Create Checkout Session",
        method: "POST",
        url: "https://api.example.com/v1/billing/sessions",
      },
    ],
  },
]

export const collectionItemToTab = (item: CollectionItem): Partial<Tab> => {
  return {
    id: item.id,
    name: item.name,
    method: (item.method || "GET") as any,
    url: item.url || "",
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", active: true },
      { id: "h2", key: "Authorization", value: "Bearer {{authToken}}", active: true },
    ],
    params: [],
    bodyType: item.method === "POST" || item.method === "PATCH" ? "json" : "none",
    body:
      item.method === "POST" || item.method === "PATCH"
        ? JSON.stringify({ email: "user@example.com", password: "••••••••" }, null, 2)
        : "",
    response: null,
    loading: false,
    isDirty: false,
  }
}
