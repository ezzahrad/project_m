import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { RootState } from '../../store'
import { loginAsync, clearError } from '../../store/slices/authSlice'
import { LoginFormData } from '../../types'

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginAsync(data) as any).unwrap()
      navigate(from, { replace: true })
    } catch (error) {
      // L'erreur est gérée par le slice
    }
  }

  React.useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
        <p className="text-gray-600">Connectez-vous à votre compte</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label className="form-label">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="votre@email.com"
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="form-label">Mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Votre mot de passe"
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading && <div className="spinner mr-2" />}
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      {/* Register link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Demo accounts */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 text-center mb-2">Comptes de démonstration :</p>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Admin :</strong> admin@gestionedt.com / password</p>
          <p><strong>Chef département :</strong> dept@gestionedt.com / password</p>
          <p><strong>Enseignant :</strong> teacher@gestionedt.com / password</p>
        </div>
      </div>
    </>
  )
}

export default LoginPage
