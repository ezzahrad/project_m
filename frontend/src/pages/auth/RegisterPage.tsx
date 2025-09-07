import React from 'react'
import { Link } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h2>
        <p className="text-gray-600">Créez votre compte</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          L'inscription est actuellement réservée aux administrateurs. 
          Contactez votre administrateur système pour obtenir un compte.
        </p>
      </div>

      <div className="text-center">
        <Link
          to="/login"
          className="btn btn-primary btn-lg"
        >
          Retour à la connexion
        </Link>
      </div>
    </>
  )
}

export default RegisterPage
