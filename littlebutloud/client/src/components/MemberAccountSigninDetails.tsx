import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Plus, Eye, EyeOff } from "lucide-react";

const accountSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
  newUsername: z.string().min(3, "Username must be at least 3 characters").optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type EditFormData = z.infer<typeof passwordSchema>;

interface MemberAccountSigninDetailsProps {
  members: any[];
}

export default function MemberAccountSigninDetails({ members }: MemberAccountSigninDetailsProps) {
  const { data: accounts = [] } = trpc.adminMemberAccounts.getAll.useQuery();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Create account for member without one
  const createAccountMutation = trpc.memberAuth.createAccount.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully!");
      setIsCreateOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  // Update password for existing account
  const utils = trpc.useUtils();
  const updatePasswordMutation = trpc.adminMemberAccounts.updatePassword.useMutation({
    onSuccess: (data) => {
      toast.success("Password updated successfully!");
      setIsEditOpen(false);
      // Update selected member with new password
      setSelectedMember((prev: any) => prev ? { ...prev, account: { ...prev.account, plainPassword: data.plainPassword } } : null);
      // Invalidate cache to refetch accounts
      utils.adminMemberAccounts.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  // Update username for existing account
  const updateUsernameMutation = trpc.adminMemberAccounts.updateUsername.useMutation({
    onSuccess: () => {
      toast.success("Username updated successfully!");
      setIsEditOpen(false);
      // Invalidate cache to refetch accounts
      utils.adminMemberAccounts.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update username");
    },
  });

  const accountMap = new Map(accounts.map((acc: any) => [acc.memberId, acc]));

  const membersWithoutAccounts = members.filter(m => !accountMap.has(m.id));
  const membersWithAccounts = members.filter(m => accountMap.has(m.id));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-lg mb-4">Members Without Accounts</h3>
        {membersWithoutAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">All members have sign-in accounts</p>
        ) : (
          <div className="space-y-2">
            {membersWithoutAccounts.map((member) => (
              <Card key={member.id} className="rounded-xl border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsCreateOpen(true);
                    }}
                    className="gap-2 rounded-full"
                  >
                    <Plus size={14} />
                    Create Account
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-bold text-lg mb-4">Members With Accounts</h3>
        {membersWithAccounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members have sign-in accounts yet</p>
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
                {membersWithAccounts.map((member) => {
                  const account = accountMap.get(member.id);
                  return (
                    <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-semibold">{member.name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{account?.username}</td>
                      <td className="py-3 px-4">
                        {account?.plainPassword ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-green-50 px-3 py-1 rounded text-xs font-mono border border-green-200 text-green-900">
                              {showPassword ? account.plainPassword : "••••••••"}
                            </code>
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1 hover:bg-muted rounded"
                              title={showPassword ? "Hide" : "Show"}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded inline-block">Click "Reset Password" to set</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember({ ...member, account });
                              setIsEditOpen(true);
                            }}
                            className="gap-2 rounded-full"
                          >
                            <Lock size={14} />
                            Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMember({ ...member, account, editUsername: true });
                              setIsEditOpen(true);
                            }}
                            className="gap-2 rounded-full"
                          >
                            Edit Username
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {selectedMember && isCreateOpen && !selectedMember.account && (
        <CreateAccountModal
          member={selectedMember}
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setSelectedMember(null);
          }}
          onSubmit={(data) => {
            createAccountMutation.mutate({
              memberId: selectedMember.id,
              username: data.username,
              password: data.password,
            });
          }}
          isLoading={createAccountMutation.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {selectedMember && isEditOpen && selectedMember.account && (
        <ResetPasswordModal
          member={selectedMember}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedMember(null);
          }}
          onSubmit={(data) => {
            if (selectedMember?.editUsername) {
              updateUsernameMutation.mutate({
                memberId: selectedMember.id,
                newUsername: data.newUsername || "",
              });
            } else {
              updatePasswordMutation.mutate({
                memberId: selectedMember.id,
                newPassword: data.newPassword || "",
              });
            }
          }}
          isLoading={updatePasswordMutation.isPending || updateUsernameMutation.isPending}
        />
      )}
    </div>
  );
}

function CreateAccountModal({
  member,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account for {member.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="Enter username"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{String(errors.username?.message)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{String(errors.password?.message)}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordModal({
  member,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  member: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordFormData) => void;
  isLoading: boolean;
}) {
  const isEditingUsername = member?.editUsername === true;
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditingUsername ? "Edit Username" : "Reset Password"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Member: <span className="font-semibold">{member.name}</span></p>
            <p className="text-sm text-muted-foreground">Username: <span className="font-mono">{member.account?.username}</span></p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isEditingUsername ? (
              <div className="space-y-2">
                <Label>New Username</Label>
                <Input
                  type="text"
                  placeholder="Enter new username"
                  {...register("newUsername")}
                />
                {errors.newUsername && (
                  <p className="text-sm text-red-600">{String(errors.newUsername?.message)}</p>
                )}
              </div>
            ) : (
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
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditingUsername ? "Updating..." : "Updating...") : (isEditingUsername ? "Update Username" : "Update Password")}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
