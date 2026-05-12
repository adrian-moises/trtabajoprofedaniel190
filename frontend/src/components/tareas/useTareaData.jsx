import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

const API_BASE   = "http://localhost:4000/api"
const API_TAREAS = `${API_BASE}/tareas`
const TOKEN_KEY  = "accessToken"

const useTareaData = () => {
  const [tareas, setTareas]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const authExpiredRef        = useRef(false)

  const getToken = () =>
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)

  const buildHeaders = (withBody = false) => ({
    ...(withBody ? { "Content-Type": "application/json" } : {}),
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  })

  const handleUnauthorized = () => {
    if (authExpiredRef.current) return
    authExpiredRef.current = true
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    toast.error("Tu sesión expiró. Inicia sesión nuevamente")
    window.location.href = "/"
  }

  const normalizeTarea = (item = {}) => ({
    id:           item._id || item.id || "",
    titulo:       item.titulo || "",
    materia:      item.materia || "",
    descripcion:  item.descripcion || "",
    fechaEntrega: item.fechaEntrega
      ? String(item.fechaEntrega).slice(0, 10)
      : "",
    prioridad: item.prioridad || "baja",
    estado:    item.estado || "pendiente",
  })

  // GET /api/tareas
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_TAREAS, {
        method: "GET",
        headers: buildHeaders(),
        credentials: "include",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) { handleUnauthorized(); return }
        setError(payload.message || "Error al cargar las tareas")
        setTareas([])
        return
      }
      const data = Array.isArray(payload) ? payload : (payload.data || [])
      setTareas(data.map(normalizeTarea))
    } catch (err) {
      setTareas([])
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // POST /api/tareas
  const createTarea = async (formData) => {
    try {
      setLoading(true)
      const response = await fetch(API_TAREAS, {
        method: "POST",
        headers: buildHeaders(true),
        credentials: "include",
        body: JSON.stringify({
          titulo:       formData.titulo.trim(),
          materia:      formData.materia.trim(),
          descripcion:  formData.descripcion.trim(),
          fechaEntrega: formData.fechaEntrega,
          prioridad:    formData.prioridad,
          estado:       formData.estado,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) { handleUnauthorized(); return false }
        toast.error(payload.message || "Error al crear la tarea")
        return false
      }
      toast.success(payload.message || "Tarea creada exitosamente")
      await fetchData()
      return true
    } catch {
      toast.error("Error de conexión con el servidor")
      return false
    } finally {
      setLoading(false)
    }
  }

  // PUT /api/tareas/:id
  const updateTarea = async (tareaId, formData) => {
    if (!tareaId) { toast.error("ID no válido"); return false }
    try {
      setLoading(true)
      const response = await fetch(`${API_TAREAS}/${tareaId}`, {
        method: "PUT",
        headers: buildHeaders(true),
        credentials: "include",
        body: JSON.stringify({
          titulo:       formData.titulo.trim(),
          materia:      formData.materia.trim(),
          descripcion:  formData.descripcion.trim(),
          fechaEntrega: formData.fechaEntrega,
          prioridad:    formData.prioridad,
          estado:       formData.estado,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) { handleUnauthorized(); return false }
        toast.error(payload.message || "Error al actualizar la tarea")
        return false
      }
      toast.success(payload.message || "Tarea actualizada exitosamente")
      await fetchData()
      return true
    } catch {
      toast.error("Error de conexión con el servidor")
      return false
    } finally {
      setLoading(false)
    }
  }

  // DELETE /api/tareas/:id
  const deleteTarea = async (tareaId) => {
    if (!tareaId) return
    try {
      setLoading(true)
      const response = await fetch(`${API_TAREAS}/${tareaId}`, {
        method: "DELETE",
        headers: buildHeaders(),
        credentials: "include",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) { handleUnauthorized(); return }
        toast.error(payload.message || "Error al eliminar la tarea")
        return
      }
      toast.success(payload.message || "Tarea eliminada exitosamente")
      await fetchData()
    } catch {
      toast.error("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return { tareas, loading, error, fetchData, createTarea, updateTarea, deleteTarea }
}

export default useTareaData
