import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('phishguard_user')
        return stored ? JSON.parse(stored) : null
    })
    const [token, setToken] = useState(() => localStorage.getItem('phishguard_token'))

    const login = useCallback(async (email, password) => {
        const res = await authAPI.login({ email, password })
        const { access_token, user: userData } = res.data
        localStorage.setItem('phishguard_token', access_token)
        localStorage.setItem('phishguard_user', JSON.stringify(userData))
        setToken(access_token)
        setUser(userData)
        return userData
    }, [])

    const register = useCallback(async (username, email, password) => {
        const res = await authAPI.register({ username, email, password })
        const { access_token, user: userData } = res.data
        localStorage.setItem('phishguard_token', access_token)
        localStorage.setItem('phishguard_user', JSON.stringify(userData))
        setToken(access_token)
        setUser(userData)
        return userData
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('phishguard_token')
        localStorage.removeItem('phishguard_user')
        setToken(null)
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
