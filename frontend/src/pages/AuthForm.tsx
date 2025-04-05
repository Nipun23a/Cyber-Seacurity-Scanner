import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Mail, Lock, User, Shield, AlertTriangle } from "lucide-react"

interface RegisterFormProps {
    passwordStrength: number;
    setPasswordInput: (value: string) => void;
}
// AuthForm component
export default function AuthForm() {
    const [isLogin, setIsLogin] = useState<boolean>(true)
    const [passwordStrength, setPasswordStrength] = useState<number>(0)
    const [passwordInput, setPasswordInput] = useState<string>("")

    const toggleForm = () => {
        setIsLogin(!isLogin)
    }




    // Password strength checker
    useEffect(() => {
        if (passwordInput) {
            let strength = 0
            // Length check
            if (passwordInput.length >= 8) strength += 1
            // Contains number
            if (/\d/.test(passwordInput)) strength += 1
            // Contains special char
            if (/[!@#$%^&*]/.test(passwordInput)) strength += 1
            // Contains uppercase
            if (/[A-Z]/.test(passwordInput)) strength += 1

            setPasswordStrength(strength)
        } else {
            setPasswordStrength(0)
        }
    }, [passwordInput])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-full opacity-20"></div>

            <Card className="w-full max-w-md overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-bl-full opacity-10"></div>

                <CardHeader className="space-y-1 relative z-10">
                    <div className="flex items-center justify-center mb-2">
                        <Shield className="h-10 w-10 text-blue-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Cyber Security Scanner
                    </CardTitle>
                    <CardTitle className="text-xl font-medium text-center mt-4">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </CardTitle>
                    <CardDescription className="text-center text-gray-500">
                        {isLogin
                            ? "Enter your credentials to access your dashboard"
                            : "Join our secure platform in just a few steps"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm key="login" />
                        ) : (
                            <RegisterForm
                                key="register"
                                passwordStrength={passwordStrength}
                                setPasswordInput={setPasswordInput}
                            />
                        )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 relative z-10 pb-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="h-4 w-4">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07h3.66c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                <path d="M1 1h22v22H1z" fill="none"/>
                            </svg>
                            Google
                        </Button>
                        <Button variant="outline" className="flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="h-4 w-4 text-black">
                                <path d="M22.451 14.116c-.232.635-.518 1.219-.854 1.776a11.35 11.35 0 0 1-1.058 1.539c-.483.581-.882.985-1.195 1.21-.478.44-1.001.664-1.57.675-.402 0-.885-.115-1.448-.347a7.438 7.438 0 0 0-1.522-.344c-.495 0-1.022.114-1.578.341-.555.228-1.001.347-1.337.356-.513.022-1.026-.209-1.54-.693-.334-.246-.754-.669-1.258-1.269-.54-.645-.982-1.395-1.327-2.25-.378-.93-.568-1.831-.568-2.703 0-1.002.217-1.868.651-2.599.34-.581.794-1.036 1.35-1.371a3.653 3.653 0 0 1 1.847-.516c.363 0 .84.112 1.432.335.59.223 1.01.336 1.258.336.138 0 .605-.132 1.398-.397.75-.245 1.382-.347 1.898-.304 1.401.113 2.455.669 3.158 1.668-1.252.765-1.871 1.829-1.855 3.21.015 1.071.399 1.961 1.151 2.674.343.328.726.58 1.151.762-.092.27-.19.529-.292.776ZM18.192 2c.01.864-.316 1.67-.978 2.417-.788.886-1.742 1.397-2.773 1.315a2.993 2.993 0 0 1-.023-.363c0-.769.331-1.592.92-2.272.294-.343.667-.627 1.12-.854.453-.223.882-.347 1.287-.37.012.043.018.086.018.127Z"/>
                            </svg>
                            Apple
                        </Button>
                    </div>

                    <div className="text-sm text-center text-gray-600 mt-2">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleForm} className="ml-1 text-blue-600 font-medium hover:underline focus:outline-none">
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

function LoginForm() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
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
            >
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </motion.div>
    )
}

function RegisterForm({ passwordStrength, setPasswordInput }: RegisterFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-medium">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="register-email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="register-password"
                        type="password"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                </div>
                <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Password strength</span>
                        <span className="text-xs font-medium">
                            {passwordStrength === 0 && "Very weak"}
                            {passwordStrength === 1 && "Weak"}
                            {passwordStrength === 2 && "Medium"}
                            {passwordStrength === 3 && "Strong"}
                            {passwordStrength === 4 && "Very strong"}
                        </span>
                    </div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${
                                passwordStrength === 0 ? 'bg-gray-300 w-0' :
                                    passwordStrength === 1 ? 'bg-red-500 w-1/4' :
                                        passwordStrength === 2 ? 'bg-yellow-500 w-2/4' :
                                            passwordStrength === 3 ? 'bg-blue-500 w-3/4' :
                                                'bg-green-500 w-full'
                            }`}
                        ></div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        id="confirm-password"
                        type="password"
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>
            <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1 text-blue-600 border-gray-300" />
                <Label htmlFor="terms" className="text-sm font-medium">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        terms of service
                    </a>
                    {" "}and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        privacy policy
                    </a>
                </Label>
            </div>
            <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                    For maximum security, use a strong password that you don't use elsewhere
                </p>
            </div>
        </motion.div>
    )
}