import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/UI/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/UI/card";
import { Input } from "../components/UI/input";
import { Label } from "../components/UI/label";

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const ok = await login(email.trim(), password);
    if (!ok) return;
    navigate("/dashboard");
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 20% 18%, rgba(130,39,39,0.35), transparent 38%)" }}
      />
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">

        <aside className="flex items-center p-8 sm:p-12 lg:p-16">
          <div className="max-w-xl">
            <span className="inline-block h-1 w-10 rounded-full bg-[#822727] mb-6" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.28em] text-white">Task</h1>
            <p className="mt-6 text-2xl leading-7 text-white/50 sm:text-lg">
              Organiza tus tareas escolares fácilmente
            </p>
          </div>
        </aside>

        <article className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <Card className="w-full max-w-lg rounded-3xl border-white/10 bg-black/30 p-2 text-white">
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-3xl font-semibold text-white">
                Bienvenido<span className="text-[#822727]">!</span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-white/40">
                Ingresa tus credenciales para continuar.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <form className="mt-3 space-y-5" onSubmit={handleSubmit}>

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 px-4 placeholder:text-white/20 focus:border-[#822727]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/5 px-4 placeholder:text-white/20 focus:border-[#822727]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-xl border-[#822727] bg-transparent text-sm font-semibold text-white hover:bg-[#822727]/15 hover:text-white"
                >
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-white/40">
                ¿Aún no tienes cuenta?{" "}
                <Link to="/register" className="font-semibold text-white hover:text-[#822727] transition-colors">
                  Crear cuenta
                </Link>
              </p>
              <p className="mt-3 text-center text-xs text-white/20">
                Demo: admin@gmail.com / 123456
              </p>
            </CardContent>
          </Card>
        </article>

      </div>
    </section>
  );
}

export default Login;
