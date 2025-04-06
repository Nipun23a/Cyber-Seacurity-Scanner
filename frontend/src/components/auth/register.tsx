import React, {useState} from "react";
import {AlertTriangle, ArrowRight, Mail, User,Lock} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input.tsx";
import { motion } from "framer-motion";
import axios from "axios";

interface RegisterFormProps {
    passwordStrength: number;
    setPasswordInput: (value: string) => void;
}


function RegisterForm({
                          passwordStrength,
                          setPasswordInput,
                          onRegistrationSuccess
                      }: RegisterFormProps & { onRegistrationSuccess?: () => void }) {
    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Form validation
        if (!fullName || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!agreeTerms) {
            setError("You must agree to the terms of service");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:5000/auth/register", {
                fullName,
                email,
                password
            });

            console.log("Registration successful:", response.data);
            setSuccess(true);

            // After successful registration, switch to login form
            setTimeout(() => {
                if (onRegistrationSuccess) {
                    onRegistrationSuccess();
                }
            }, 2000);
        } catch (error: any) {
            console.error("Error registering user:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError("Registration failed. Please try again.");
            }

            // For development purposes - to bypass backend
            // Remove this in production
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Simulating successful registration');
                setSuccess(true);
                setTimeout(() => {
                    if (onRegistrationSuccess) {
                        onRegistrationSuccess();
                    }
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
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

            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    Registration successful! You can now sign in.
                </div>
            )}

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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordInput(e.target.value);
                        }}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-start space-x-2">
                <Checkbox
                    id="terms"
                    className="mt-1 text-blue-600 border-gray-300"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
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
                disabled={loading}
            >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                    For maximum security, use a strong password that you don't use elsewhere
                </p>
            </div>
        </motion.form>
    );
}

export default RegisterForm