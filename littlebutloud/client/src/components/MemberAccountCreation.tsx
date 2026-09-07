import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

// ─── Account Creation Schema ──────────────────────────────────────────────────
const accountSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AccountFormData = z.infer<typeof accountSchema>;

interface MemberAccountCreationProps {
  memberId: number;
  memberName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MemberAccountCreation({
  memberId,
  memberName,
  onSuccess,
  onCancel,
}: MemberAccountCreationProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(accountSchema),
  });

  const createAccountMutation = trpc.memberAuth.createAccount.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully! You can now login with your credentials.");
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const onSubmit = (data: AccountFormData) => {
    createAccountMutation.mutate({
      memberId,
      username: data.username,
      password: data.password,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus size={20} />
          Create Your Account
        </CardTitle>
        <CardDescription>
          Set up login credentials for {memberName}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit((data: any) => onSubmit(data as AccountFormData))} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
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
              placeholder="Enter a password (min 6 characters)"
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-600">{String(errors.password?.message)}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{String(errors.confirmPassword?.message)}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createAccountMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="flex-1"
            >
              {createAccountMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center pt-2">
            You'll use these credentials to login to the Members Portal and manage your events.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
