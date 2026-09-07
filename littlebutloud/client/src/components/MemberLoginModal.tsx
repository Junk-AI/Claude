import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (session: any) => void;
}

export default function MemberLoginModal({ isOpen, onClose, onLoginSuccess }: MemberLoginModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(loginSchema),
  });
  const { setMemberLoggedIn } = useMemberAuth();

  const loginMutation = trpc.memberAuth.login.useMutation({
    onSuccess: (data) => {
      // Update member auth context
      setMemberLoggedIn(true, data.memberId, data.username);
      toast.success(`Welcome, ${data.memberName}!`);
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn size={20} />
            Member Login
          </DialogTitle>
          <DialogDescription>
            Sign in to your member account to create and manage events
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data: any) => onSubmit(data as LoginFormData))} className="space-y-4">
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/connect" className="text-blue-600 hover:underline">
              Join the network
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
