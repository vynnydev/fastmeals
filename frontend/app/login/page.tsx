'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/auth-store'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email e obrigatorio')
    .email('Email invalido'),
  password: z
    .string()
    .min(1, 'Senha e obrigatoria')
    .min(6, 'Senha deve ter no minimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, checkAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    checkAuth()
  }, [checkAuth])

  // Redirect if already authenticated
  useEffect(() => {
    if (isClient && isAuthenticated) {
      window.location.href = '/'
    }
  }, [isClient, isAuthenticated])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Login realizado com sucesso!')
      // Use window.location to avoid router initialization issues
      window.location.href = '/'
    } catch {
      toast.error('Credenciais invalidas. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-gradient mb-6">
              <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              FastMeals
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sistema de Gestao de Pedidos e Entregas
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="h-12 bg-secondary border-border focus:border-primary focus:ring-primary"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    autoComplete="current-password"
                    className="h-12 bg-secondary border-border focus:border-primary focus:ring-primary pr-12"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Lembrar-me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 gold-gradient text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="rounded-lg border border-border bg-card/50 p-4">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Credenciais de demonstracao:
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Admin:</p>
                <p className="text-foreground font-mono">admin@fastmeals.com</p>
                <p className="text-foreground font-mono">admin123</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Viewer:</p>
                <p className="text-foreground font-mono">viewer@fastmeals.com</p>
                <p className="text-foreground font-mono">viewer123</p>
              </div>
            </div>
          </div> */}

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            FastMeals 2026. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login-background-nXilrGjr9vGTieihA5VhRyS8r7Nt5L.png')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

        {/* Content on image */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-8 bg-primary rounded-full" />
              <span className="text-sm text-primary font-medium">FastMeals</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-balance">
              Nao é apenas comida, é uma experiência.
            </h2>
            <p className="text-lg text-white/80">
              Gerencie seus pedidos, otimize suas entregas e acompanhe tudo em tempo real com nosso  inteligente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
