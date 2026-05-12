import React, { createContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"

const AuthContext = createContext(null)
export { AuthContext }

const API_URL    = "http://localhost:4000/api"
const STORAGE_KEY  = "accessToken"
const REMEMBER_KEY = "rememberDevice"

const decodeJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=")))
  } catch { return null }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  const getStoredToken = useCallback(
    () => localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY),
    []
  )

  const persistToken = useCallback((token, rememberMe) => {
    if (!token) return
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, token)
      sessionStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(REMEMBER_KEY, "1")
    } else {
      sessionStorage.setItem(STORAGE_KEY, token)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(REMEMBER_KEY, "0")
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(REMEMBER_KEY)
    setUser(null)
  }, [])

  // POST /api/logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
      })
    } catch {}
    clearSession()
    navigate("/")
  }, [clearSession, navigate])

  // POST /api/login
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        const { toast } = await import("sonner")
        toast.error(payload.message || "Credenciales incorrectas")
        return false
      }

      // El backend devuelve { message, accessToken }
      const accessToken = payload.accessToken || null

      if (accessToken) {
        persistToken(accessToken, rememberMe)
        const decoded = decodeJwt(accessToken)
        setUser(decoded ? { id: decoded.id, userType: decoded.userType } : null)
      }

      const { toast } = await import("sonner")
      toast.success(payload.message || "Inicio de sesión exitoso")
      return true
    } catch {
      const { toast } = await import("sonner")
      toast.error("Error de conexión con el servidor")
      return false
    }
  }

  useEffect(() => {
    const token = getStoredToken()
    if (token) {
      const decoded = decodeJwt(token)
      const isExpired = decoded?.exp && decoded.exp * 1000 <= Date.now()
      if (decoded && !isExpired) {
        setUser({ id: decoded.id, userType: decoded.userType })
      } else {
        clearSession()
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, logout, login, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
