import { Fragment, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../components/UI/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/UI/alert-dialog"
import { Badge } from "../components/UI/badge"
import { Button } from "../components/UI/button"
import { Card, CardContent } from "../components/UI/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/UI/dialog"
import { Input } from "../components/UI/input"
import { Label } from "../components/UI/label"
import { Select, SelectItem } from "../components/UI/select"
import { Separator } from "../components/UI/separator"
import { Skeleton } from "../components/UI/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/UI/table"
import { useAuth } from "../hooks/useAuth"
import useTareaData from "../components/tareas/useTareaData"

const PRIORIDAD_OPTIONS = ["baja", "media", "alta"]
const ESTADO_OPTIONS = ["pendiente", "en progreso", "completada"]

const emptyTareaForm = {
  titulo: "",
  materia: "",
  descripcion: "",
  fechaEntrega: "",
  prioridad: "baja",
  estado: "pendiente",
}

const sortOptions = [
  { value: "titulo-asc",  label: "Título A-Z" },
  { value: "titulo-desc", label: "Título Z-A" },
  { value: "fecha-asc",   label: "Fecha más próxima" },
  { value: "fecha-desc",  label: "Fecha más lejana" },
]

const estadoFilterOptions = [
  { value: "all",         label: "Todos los estados" },
  { value: "pendiente",   label: "Pendientes" },
  { value: "en progreso", label: "En progreso" },
  { value: "completada",  label: "Completadas" },
]

const badgeCellClassName = "inline-flex h-7 min-w-24 justify-center rounded-full px-3 text-center text-xs font-semibold"

const prioridadColor = {
  alta:  "border-red-500/30 bg-red-500/15 text-red-300",
  media: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
  baja:  "border-green-500/30 bg-green-500/15 text-green-300",
}

const estadoColor = {
  pendiente:     "border-white/20 bg-transparent text-white/60",
  "en progreso": "border-blue-500/30 bg-blue-500/15 text-blue-300",
  completada:    "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
}

const validateTareaForm = (form) => {
  const errors = {}
  if (!form.titulo.trim())  errors.titulo = "El título es requerido"
  if (!form.materia.trim()) errors.materia = "La materia es requerida"
  if (!form.fechaEntrega)   errors.fechaEntrega = "La fecha de entrega es requerida"
  return errors
}

function Tarea() {
  const { logout } = useAuth()
  const { tareas, loading, error, createTarea, updateTarea, deleteTarea } = useTareaData()

  const [expandedRowId, setExpandedRowId] = useState(null)
  const [currentPage, setCurrentPage]     = useState(1)
  const [isCreateOpen, setIsCreateOpen]   = useState(false)
  const [isEditOpen, setIsEditOpen]       = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [createForm, setCreateForm]       = useState(emptyTareaForm)
  const [editForm, setEditForm]           = useState({ ...emptyTareaForm, id: "" })
  const [createErrors, setCreateErrors]   = useState({})
  const [editErrors, setEditErrors]       = useState({})
  const [searchText, setSearchText]       = useState("")
  const [estadoFilter, setEstadoFilter]   = useState("all")
  const [sortBy, setSortBy]               = useState("titulo-asc")

  const rowsPerPage = 8

  const filteredTareas = useMemo(() => {
    const term = searchText.trim().toLowerCase()
    const matches = tareas.filter((t) => {
      const bySearch = !term ||
        t.titulo.toLowerCase().includes(term) ||
        t.materia.toLowerCase().includes(term) ||
        (t.descripcion || "").toLowerCase().includes(term)
      const byEstado = estadoFilter === "all" || t.estado === estadoFilter
      return bySearch && byEstado
    })
    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case "titulo-desc": return b.titulo.localeCompare(a.titulo, "es")
        case "fecha-asc":   return new Date(a.fechaEntrega) - new Date(b.fechaEntrega)
        case "fecha-desc":  return new Date(b.fechaEntrega) - new Date(a.fechaEntrega)
        default:            return a.titulo.localeCompare(b.titulo, "es")
      }
    })
  }, [tareas, searchText, estadoFilter, sortBy])

  const totalPages   = Math.max(1, Math.ceil(filteredTareas.length / rowsPerPage))
  const paginated    = useMemo(() => filteredTareas.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [currentPage, filteredTareas])
  const hasFilters   = estadoFilter !== "all" || searchText.trim() || sortBy !== "titulo-asc"

  const toggleRow    = (id) => setExpandedRowId(prev => prev === id ? null : id)

  const openEdit = (t) => {
    setEditForm({ id: t.id, titulo: t.titulo, materia: t.materia, descripcion: t.descripcion, fechaEntrega: t.fechaEntrega, prioridad: t.prioridad, estado: t.estado })
    setEditErrors({})
    setIsEditOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = validateTareaForm(createForm)
    setCreateErrors(errs)
    if (Object.keys(errs).length > 0) return
    const ok = await createTarea(createForm)
    if (ok) { setCreateForm(emptyTareaForm); setCreateErrors({}); setIsCreateOpen(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    const errs = validateTareaForm(editForm)
    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return
    const ok = await updateTarea(editForm.id, editForm)
    if (ok) { setEditErrors({}); setIsEditOpen(false) }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteTarea(deleteTarget.id)
    setExpandedRowId(prev => prev === deleteTarget.id ? null : prev)
    setDeleteTarget(null)
  }

  return (
    <div className="flex h-screen flex-col bg-[#111111]">

      <header className="border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block h-1 w-6 rounded-full bg-[#822727]" />
            <h1 className="text-lg font-bold uppercase tracking-widest text-white">Task</h1>
          </div>
          <Button variant="outline" onClick={logout} className="h-8 rounded-full border-white/15 bg-transparent px-4 text-xs text-white/60 hover:bg-white/10 hover:text-white">
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl space-y-4">

          <div className="space-y-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-sm">
            <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }} placeholder="Buscar por título, materia..." className="h-10 w-full rounded-full border border-white/15 bg-black/25 pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#822727] transition-colors" />
              </div>
              <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setCurrentPage(1) }}>
                {estadoFilterOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </Select>
              <Button onClick={() => { setCreateForm(emptyTareaForm); setCreateErrors({}); setIsCreateOpen(true) }} className="flex h-10 items-center gap-2 rounded-full border border-[#822727]/70 bg-transparent px-4 text-sm font-semibold text-white hover:bg-[#822727]/15 transition-colors">
                <Plus className="h-4 w-4" /> Nueva tarea
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-3">
              {[
                { key: "all", label: "Todas", count: tareas.length },
                { key: "pendiente", label: "Pendientes", count: tareas.filter(t => t.estado === "pendiente").length },
                { key: "en progreso", label: "En progreso", count: tareas.filter(t => t.estado === "en progreso").length },
                { key: "completada", label: "Completadas", count: tareas.filter(t => t.estado === "completada").length },
              ].map(item => (
                <button key={item.key} onClick={() => { setEstadoFilter(item.key); setCurrentPage(1) }} className={`inline-flex items-center gap-2 border-b-2 px-1 py-1 text-sm font-semibold transition-colors ${estadoFilter === item.key ? "border-[#822727] text-white" : "border-transparent text-white/50 hover:text-white"}`}>
                  {item.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${estadoFilter === item.key ? "bg-[#822727] text-white" : "bg-white/10 text-white/70"}`}>{item.count}</span>
                </button>
              ))}
              <div className="ml-auto text-xs text-white/40">{filteredTareas.length} resultados</div>
              {hasFilters && (
                <Button variant="ghost" className="h-8 rounded-full px-3 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => { setSearchText(""); setEstadoFilter("all"); setSortBy("titulo-asc") }}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          <Card className="border-white/10 bg-[#111111]/90 text-white shadow-xl">
            <CardContent className="flex flex-col pt-3">
              {error && <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}

              <div className="overflow-auto rounded-2xl border border-white/10 bg-[#151515]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-[#151515]">
                    <TableRow className="border-white/10 hover:bg-[#151515]">
                      <TableHead className="text-white/45">No.</TableHead>
                      <TableHead className="text-white/45">Título</TableHead>
                      <TableHead className="text-white/45">Materia</TableHead>
                      <TableHead className="text-white/45">Fecha Entrega</TableHead>
                      <TableHead className="text-white/45">Prioridad</TableHead>
                      <TableHead className="text-white/45">Estado</TableHead>
                      <TableHead className="w-32 text-right text-white/45">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && Array.from({ length: 5 }, (_, i) => (
                      <TableRow key={`sk-${i}`} className="border-white/10">
                        {[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full bg-white/10" /></TableCell>)}
                      </TableRow>
                    ))}
                    {!loading && paginated.length === 0 && (
                      <TableRow className="border-white/10">
                        <TableCell colSpan={7} className="py-10 text-center text-white/40">No hay tareas para mostrar.</TableCell>
                      </TableRow>
                    )}
                    {!loading && paginated.map((item, index) => {
                      const num = (currentPage - 1) * rowsPerPage + index + 1
                      return (
                        <Fragment key={`${item.id}-g`}>
                          <TableRow className={`border-white/10 hover:bg-white/4 transition-colors ${expandedRowId === item.id ? "bg-white/4" : ""}`}>
                            <TableCell className="text-white/60">{num}</TableCell>
                            <TableCell className="font-medium text-white">{item.titulo}</TableCell>
                            <TableCell className="text-white/60">{item.materia}</TableCell>
                            <TableCell className="text-white/60">{item.fechaEntrega}</TableCell>
                            <TableCell><Badge variant="outline" className={`${badgeCellClassName} ${prioridadColor[item.prioridad]}`}>{item.prioridad}</Badge></TableCell>
                            <TableCell><Badge variant="outline" className={`${badgeCellClassName} ${estadoColor[item.estado]}`}>{item.estado}</Badge></TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-md border border-white/15 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => toggleRow(item.id)}>
                                  {expandedRowId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-md border border-white/15 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => openEdit(item)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-md border border-[#822727]/35 bg-[#822727]/10 text-[#ff8f8f] hover:bg-[#822727]/20" onClick={() => setDeleteTarget(item)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedRowId === item.id && (
                            <TableRow key={`${item.id}-e`} className="border-white/10 bg-white/4">
                              <TableCell colSpan={7}>
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-wider text-white/40">ID</p>
                                    <p className="mt-1 text-sm text-white">{num}</p>
                                  </div>
                                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-wider text-white/40">Descripción</p>
                                    <p className="mt-1 text-sm text-white">{item.descripcion || "Sin descripción"}</p>
                                  </div>
                                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                                    <p className="text-[11px] uppercase tracking-wider text-white/40">Estado</p>
                                    <p className="mt-1 text-sm text-white">{item.estado}</p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                <p className="text-xs text-white/55">
                  {filteredTareas.length === 0 ? "0 resultados" : `Mostrando ${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredTareas.length)} de ${filteredTareas.length}`}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" className="h-9 rounded-full border-white/15 bg-transparent px-3 text-sm text-white/70 hover:bg-white/10" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button key={page} variant="outline" className={`h-9 min-w-9 rounded-full border px-3 text-sm ${currentPage === page ? "border-[#822727] bg-[#822727] text-white" : "border-white/15 bg-transparent text-white/70 hover:bg-white/10"}`} onClick={() => setCurrentPage(page)}>{page}</Button>
                  ))}
                  <Button variant="outline" className="h-9 rounded-full border-white/15 bg-transparent px-3 text-sm text-white/70 hover:bg-white/10" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL CREAR */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
            <DialogDescription>Completa el formulario para registrar una nueva tarea.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <Alert>
              <AlertTitle>Campos requeridos</AlertTitle>
              <AlertDescription>El título, materia y fecha de entrega son obligatorios.</AlertDescription>
            </Alert>
            <div className="space-y-1.5">
              <Label htmlFor="c-titulo">Título</Label>
              <Input id="c-titulo" placeholder="Ej. Proyecto final" value={createForm.titulo} onChange={e => { setCreateForm(p => ({ ...p, titulo: e.target.value })); if (createErrors.titulo) setCreateErrors(p => ({ ...p, titulo: "" })) }} />
              {createErrors.titulo && <p className="text-xs text-red-400">{createErrors.titulo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-materia">Materia</Label>
              <Input id="c-materia" placeholder="Ej. Programación" value={createForm.materia} onChange={e => { setCreateForm(p => ({ ...p, materia: e.target.value })); if (createErrors.materia) setCreateErrors(p => ({ ...p, materia: "" })) }} />
              {createErrors.materia && <p className="text-xs text-red-400">{createErrors.materia}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-desc">Descripción</Label>
              <Input id="c-desc" placeholder="Descripción breve (opcional)" value={createForm.descripcion} onChange={e => setCreateForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="c-fecha">Fecha de entrega</Label>
                <Input id="c-fecha" type="date" value={createForm.fechaEntrega} onChange={e => { setCreateForm(p => ({ ...p, fechaEntrega: e.target.value })); if (createErrors.fechaEntrega) setCreateErrors(p => ({ ...p, fechaEntrega: "" })) }} />
                {createErrors.fechaEntrega && <p className="text-xs text-red-400">{createErrors.fechaEntrega}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={createForm.prioridad} onValueChange={v => setCreateForm(p => ({ ...p, prioridad: v }))}>
                  {PRIORIDAD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={createForm.estado} onValueChange={v => setCreateForm(p => ({ ...p, estado: v }))}>
                {ESTADO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-10 border-white/15 px-5 text-white/70 hover:bg-white/10" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-10 bg-[#822727] px-5 text-white hover:bg-[#9b2f2f]">{loading ? "Guardando..." : "Guardar tarea"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>Modificá la información y guardá los cambios.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEdit}>
            <div className="space-y-1.5">
              <Label htmlFor="e-titulo">Título</Label>
              <Input id="e-titulo" value={editForm.titulo} onChange={e => { setEditForm(p => ({ ...p, titulo: e.target.value })); if (editErrors.titulo) setEditErrors(p => ({ ...p, titulo: "" })) }} />
              {editErrors.titulo && <p className="text-xs text-red-400">{editErrors.titulo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-materia">Materia</Label>
              <Input id="e-materia" value={editForm.materia} onChange={e => { setEditForm(p => ({ ...p, materia: e.target.value })); if (editErrors.materia) setEditErrors(p => ({ ...p, materia: "" })) }} />
              {editErrors.materia && <p className="text-xs text-red-400">{editErrors.materia}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-desc">Descripción</Label>
              <Input id="e-desc" value={editForm.descripcion} onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fecha de entrega</Label>
                <Input type="date" value={editForm.fechaEntrega} onChange={e => { setEditForm(p => ({ ...p, fechaEntrega: e.target.value })); if (editErrors.fechaEntrega) setEditErrors(p => ({ ...p, fechaEntrega: "" })) }} />
                {editErrors.fechaEntrega && <p className="text-xs text-red-400">{editErrors.fechaEntrega}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={editForm.prioridad} onValueChange={v => setEditForm(p => ({ ...p, prioridad: v }))}>
                  {PRIORIDAD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={editForm.estado} onValueChange={v => setEditForm(p => ({ ...p, estado: v }))}>
                {ESTADO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" className="h-10 border-white/15 px-5 text-white/70 hover:bg-white/10" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-10 bg-[#822727] px-5 text-white hover:bg-[#9b2f2f]">{loading ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR ELIMINAR */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>{`¿Estás seguro de eliminar "${deleteTarget?.titulo ?? "esta tarea"}"? Esta acción no se puede deshacer.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

export default Tarea
