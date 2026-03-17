"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/stores/authStore";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      router.push("/app");
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="bg-discord-bg-secondary rounded-lg shadow-2xl w-full max-w-md p-8 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-discord-blurple flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg tracking-tighter">CN</span>
        </div>
        <h1 className="text-2xl font-bold text-discord-text-primary">Welcome back to Cypher-Net!</h1>
        <p className="text-discord-text-secondary text-sm mt-1">
          We&apos;re so excited to see you again!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-1.5">
            Email <span className="text-discord-red">*</span>
          </label>
          <input
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? "border-discord-red" : ""}`}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            })}
          />
          {errors.email && (
            <p className="text-discord-red text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-1.5">
            Password <span className="text-discord-red">*</span>
          </label>
          <input
            type="password"
            autoComplete="current-password"
            className={`input-field ${errors.password ? "border-discord-red" : ""}`}
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-discord-red text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-discord-red/10 border border-discord-red/30 rounded px-3 py-2">
            <p className="text-discord-red text-sm">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full mt-2"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-discord-text-muted text-sm mt-4">
        Need an account?{" "}
        <Link href="/auth/register" className="text-discord-blurple hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
