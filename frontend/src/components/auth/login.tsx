// Login Form
import {ArrowRight, Mail} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import { Checkbox } from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input.tsx";
import {useState} from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {Lock} from "lucide-react";

function LoginForm({ onLoginSuccess }: { onLoginSuccess?: (token: string) => void }) {
    const [emailInput, setEmailInput] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>("")
    const [passwordInput, setPasswordInput] = useState<string>("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await axios.post("http://localhost:5000/auth/login", {
                email: emailInput,
                password: passwordInput,
            })

            console.log(response.data)

            // If login is successful and we have a token
            if (response.data && response.data.token) {
                // Call the onLoginSuccess callback with the token
                if (onLoginSuccess) {
                    onLoginSuccess(response.data.token)
                }
            }
        } catch (error) {
            setError('Invalid credentials, please try again')

            // For development purposes - to bypass backend authentication
            // Remove this in production
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Simulating successful login')
                if (onLoginSuccess) {
                    onLoginSuccess('dev-mock-token')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    <button className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="password"
                        type="password"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="text-blue-600 border-gray-300" />
                <Label htmlFor="remember" className="text-sm font-medium">
                    Remember me for 30 days
                </Label>
            </div>
            <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
        </motion.div>
    )
}

export default LoginForm;