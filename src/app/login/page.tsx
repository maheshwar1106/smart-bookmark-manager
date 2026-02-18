import { Suspense } from "react";
import LoginPage from "@/views/login/Login"; 

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <LoginPage />
        </Suspense>
    );
}