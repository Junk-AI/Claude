import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { useMemberAuth } from "@/contexts/MemberAuthContext";

// ─── Login Schema ─────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface MembersPortalLoginProps {
  onLoginSuccess?: () => void;
}

export default function MembersPortalLogin({ onLoginSuccess }: MembersPortalLoginProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { setMemberLoggedIn } = useMemberAuth();

  const loginMutation = trpc.memberAuth.login.useMutation({
    onSuccess: (data) => {
      // Update member auth context
      setMemberLoggedIn(true, data.memberId, data.username);
      toast.success("Logged in successfully!");
      if (onLoginSuccess) onLoginSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please check your credentials.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn size={20} />
          Member Login
        </CardTitle>
        <CardDescription>
          Sign in to access the Members Portal
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username")}
            />
            {errors.username && <p className="text-sm text-red-600">{String(errors.username?.message)}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-600">{String(errors.password?.message)}</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending ? "Logging in..." : "Sign In"}
          </Button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center pt-2">
            Use the username and password you created when joining the network.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
