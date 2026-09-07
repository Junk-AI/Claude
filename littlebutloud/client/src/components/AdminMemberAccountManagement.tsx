import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Edit, Lock } from "lucide-react";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminMemberAccountManagement() {
  const { data: accounts, isLoading, refetch } = trpc.adminMemberAccounts.getAll.useQuery();
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Member Account Management</h2>
        <p className="text-muted-foreground mt-1">View and manage member login credentials</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading member accounts...</CardContent>
        </Card>
      ) : !accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No member accounts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Member Name</th>
                <th className="text-left py-3 px-4 font-semibold">Username</th>
                <th className="text-left py-3 px-4 font-semibold">Password</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account: any) => (
                <tr key={account.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4">{account.memberName || "Unknown"}</td>
                  <td className="py-3 px-4 font-mono text-xs">{account.username}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {showPassword ? account.passwordHash?.substring(0, 20) + "..." : "••••••••"}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-muted rounded"
                        title={showPassword ? "Hide" : "Show"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAccount(account);
                        setIsEditOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Lock size={14} />
                      Change Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Password Modal */}
      {selectedAccount && isEditOpen && (
        <PasswordChangeModal
          account={selectedAccount}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedAccount(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function PasswordChangeModal({
  account,
  isOpen,
  onClose,
}: {
  account: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updatePasswordMutation = trpc.adminMemberAccounts.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully!");
      reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      memberId: account.memberId,
      newPassword: data.newPassword,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Member: <span className="font-semibold">{account.memberName}</span></p>
            <p className="text-sm text-muted-foreground">Username: <span className="font-mono">{account.username}</span></p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600">{String(errors.newPassword?.message)}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePasswordMutation.isPending}>
                {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
