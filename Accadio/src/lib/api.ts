// Centralized API Client for Accadio Backend (PostgreSQL)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveApiUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const isAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  if (isAdminPage) {
    const adminRouteMap: Record<string, string> = {
      "/auth": "/api/admin/auth",
      "/dashboard": "/api/admin/dashboard",
      "/homepage": "/api/admin/homepage",
      "/programs": "/api/admin/programs",
      "/contact": "/api/admin/contact",
      "/pages": "/api/admin/pages",
      "/media": "/api/admin/media",
      "/testimonials": "/api/admin/testimonials",
      "/history": "/api/admin/history",
      "/news": "/api/admin/news",
    };

    for (const [prefix, target] of Object.entries(adminRouteMap)) {
      if (normalizedEndpoint === prefix || normalizedEndpoint.startsWith(`${prefix}/`)) {
        const suffix = normalizedEndpoint.slice(prefix.length);
        const query = normalizedEndpoint.includes("?") ? normalizedEndpoint.slice(normalizedEndpoint.indexOf("?")) : "";
        return `${target}${suffix}${query}`;
      }
    }

    if (normalizedEndpoint === "/media/upload") {
      return "/api/admin/media";
    }

    if (normalizedEndpoint === "/contact/inquiries") {
      return "/api/admin/contact";
    }

    if (normalizedEndpoint.startsWith("/api/")) {
      return normalizedEndpoint;
    }

    return `/api/admin${normalizedEndpoint}`;
  }

  return `${API_BASE_URL}${normalizedEndpoint}`;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = resolveApiUrl(endpoint);

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Include credentials for session cookies
  const config: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials || "same-origin",
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData?.error) errorMsg = errData.error;
    } catch {
      // Non-JSON error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// Upload file helper
export async function uploadMediaFile(file: File, category: string = "images"): Promise<{ url: string; path: string; file: any }> {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("category", category);

  const res = await fetchApi<{ success: boolean; url: string; path: string; file: any }>("/media/upload", {
    method: "POST",
    body: formData,
  });

  return res;
}

// Public Homepage API
export async function getHomepageContent() {
  return fetchApi("/homepage");
}

// Public Programs API
export async function getPrograms(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const q = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/programs${q}`);
}

// Public Testimonials API
export async function getTestimonials() {
  return fetchApi("/testimonials");
}

// Public Contact API
export async function getContactInfo() {
  return fetchApi("/contact");
}

export async function submitInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  message: string;
}) {
  return fetchApi("/contact/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
