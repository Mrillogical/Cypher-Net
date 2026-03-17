"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/stores/authStore";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    try {
      await registerUser(data.username, data.email, data.password);
      router.push("/app");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors?.length) {
        setServerError(apiErrors.map((e: any) => e.message).join(", "));
      } else {
        setServerError(err?.response?.data?.message || "Registration failed.");
      }
    }
  };

  return (
    <div className="bg-discord-bg-secondary rounded-lg shadow-2xl w-full max-w-md p-8 animate-slide-up">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-discord-blurple flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg tracking-tighter">CN</span>
        </div>
        <h1 className="text-2xl font-bold text-discord-text-primary">Join Cypher-Net</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-discord-text-secondary mb-1.5">
            Username <span className="text-discord-red">*</span>
          </label>
          <input
            type="text"
            autoComplete="username"
            className={`input-field ${errors.username ? "border-discord-red" : ""}`}
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
              maxLength: { value: 32, message: "At most 32 characters" },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: "Letters, numbers, and underscores only",
              },
            })}
          />
          {errors.username && (
            <p className="text-discord-red text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            className={`input-field ${errors.password ? "border-discord-red" : ""}`}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
          />
          {errors.password && (
            <p className="text-discord-red text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="bg-discord-red/10 border border-discord-red/30 rounded px-3 py-2">
            <p className="text-discord-red text-sm">{serverError}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
          {isSubmitting ? "Creating account..." : "Continue"}
        </button>
      </form>

      <p className="text-discord-text-muted text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-discord-blurple hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
