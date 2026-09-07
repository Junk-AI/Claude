import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Edit2, Save, Upload, Image as ImageIcon, ExternalLink } from "lucide-react";
import ImageCropperModal from "@/components/ImageCropperModal";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  country: z.string().optional(),
  memberType: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  social: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface MemberProfileProps {
  showPasswordOnly?: boolean;
}

// Parse social media handles from a string (e.g., "fb: facebook.com/handle, ig: instagram.com/handle")
function parseSocialHandles(socialString?: string | null) {
  if (!socialString) return { facebook: null as string | null, instagram: null as string | null };
  
  const handles = { facebook: null as string | null, instagram: null as string | null };
  const parts = socialString.split(',').map(p => p.trim());
  
  parts.forEach(part => {
    if (part.toLowerCase().startsWith('fb:') || part.toLowerCase().startsWith('facebook:')) {
      handles.facebook = part.split(':')[1]?.trim() || null;
    } else if (part.toLowerCase().startsWith('ig:') || part.toLowerCase().startsWith('instagram:')) {
      handles.instagram = part.split(':')[1]?.trim() || null;
    }
  });
  
  return handles;
}

// Format social handles back to string
function formatSocialHandles(facebook?: string, instagram?: string) {
  const handles = [];
  if (facebook) handles.push(`fb: ${facebook}`);
  if (instagram) handles.push(`ig: ${instagram}`);
  return handles.join(', ');
}

export default function MemberProfile({ showPasswordOnly = false }: MemberProfileProps) {
  const { user } = useAuth();
  const { memberId } = useMemberAuth();
  const utils = trpc.useUtils();
  const { data: member, isLoading } = trpc.members.getById.useQuery(
    { id: memberId || 0 },
    { enabled: !!memberId }
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCoverUploadOpen, setIsCoverUploadOpen] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const currentMember = member;

  const updateProfileMutation = trpc.members.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      utils.members.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const uploadCoverImageMutation = trpc.members.uploadCoverImage.useMutation({
    onSuccess: () => {
      toast.success("Cover image updated successfully!");
      setIsCoverUploadOpen(false);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      utils.members.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload cover image");
    },
  });

  const changePasswordMutation = trpc.memberAuth.memberChangePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
      resetPassword();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile, watch: watchProfile } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      memberType: "",
      description: "",
      website: "",
      social: "",
    },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update form values when member data loads
  useEffect(() => {
    if (currentMember) {
      resetProfile({
        name: currentMember.name || "",
        email: currentMember.email || "",
        country: currentMember.country ?? "",
        memberType: currentMember.memberType ?? "",
        description: currentMember.description ?? "",
        website: currentMember.website ?? "",
        social: currentMember.social ?? "",
      });
    }
  }, [currentMember, resetProfile]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading profile...</div>;
  }

  if (!currentMember) {
    return <div className="text-center py-8 text-muted-foreground">Member not found</div>;
  }

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!currentMember) return;
    updateProfileMutation.mutate({
      id: currentMember.id,
      ...data,
    });
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    if (!currentMember) return;
    changePasswordMutation.mutate({
      memberId: currentMember.id,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const { facebook, instagram } = parseSocialHandles(currentMember.social);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      {/* Cover Image */}
      <Card className="rounded-3xl border-0 shadow-sm w-full mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full bg-gradient-to-br from-primary/20 to-pink-50 flex items-center justify-center overflow-hidden" style={{ aspectRatio: "16/6" }}>
            {currentMember.coverImageUrl ? (
              <img
                src={currentMember.coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary">
                {currentMember.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCoverUploadOpen(true)}
              className="gap-2 rounded-full"
            >
              <Upload size={16} />
              Change Cover Image
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Display/Edit */}
      {!showPasswordOnly && (
        <Card className="rounded-3xl border-0 shadow-sm w-full mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Edit2 size={20} />
              My Profile
            </CardTitle>
            {!isEditingProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingProfile(true)}
                className="gap-2 rounded-full"
              >
                <Edit2 size={16} />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditingProfile ? (
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5 w-full">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Your name"
                    {...registerProfile("name")}
                    className="w-full"
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-red-600">{String(profileErrors.name?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...registerProfile("email")}
                    className="w-full"
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-600">{String(profileErrors.email?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    placeholder="Your country"
                    {...registerProfile("country")}
                    className="w-full"
                  />
                  {profileErrors.country && (
                    <p className="text-sm text-red-600">{String(profileErrors.country?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Member Type</Label>
                  <Input
                    placeholder="e.g., Individual, Organization"
                    {...registerProfile("memberType")}
                    className="w-full"
                  />
                  {profileErrors.memberType && (
                    <p className="text-sm text-red-600">{String(profileErrors.memberType?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    {...registerProfile("website")}
                    className="w-full"
                  />
                  {profileErrors.website && (
                    <p className="text-sm text-red-600">{String(profileErrors.website?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Social Media Handles</Label>
                  <Textarea
                    placeholder="e.g., fb: facebook.com/handle, ig: instagram.com/handle"
                    className="w-full min-h-20"
                    {...registerProfile("social")}
                  />
                  <p className="text-xs text-muted-foreground">Format: fb: [facebook url], ig: [instagram url]</p>
                  {profileErrors.social && (
                    <p className="text-sm text-red-600">{String(profileErrors.social?.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="w-full min-h-24"
                    {...registerProfile("description")}
                  />
                  {profileErrors.description && (
                    <p className="text-sm text-red-600">{String(profileErrors.description?.message)}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full sm:w-auto">
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold break-words">{currentMember.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold break-words">{currentMember.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-semibold break-words">{currentMember.country || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Type</p>
                    <p className="font-semibold break-words">{currentMember.memberType || "Not specified"}</p>
                  </div>
                </div>

                {currentMember.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a href={currentMember.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      {currentMember.website}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {(facebook || instagram) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Social Media</p>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {facebook && (
                        <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm sm:text-base">
                          Facebook
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {instagram && (
                        <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm sm:text-base">
                          Instagram
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {currentMember.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-foreground/80 whitespace-pre-wrap break-words">{currentMember.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Password Change */}
      {!showPasswordOnly && (
      <Card className="rounded-3xl border-0 shadow-sm w-full">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Lock size={20} />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsChangePasswordOpen(true)}
            className="gap-2 rounded-full w-full sm:w-auto"
          >
            <Lock size={16} />
            Change Password
          </Button>
        </CardContent>
      </Card>
      )}

      {/* Change Password Modal */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md w-full mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 w-full">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                {...registerPassword("currentPassword")}
                className="w-full"
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">{String(passwordErrors.currentPassword?.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                {...registerPassword("newPassword")}
                className="w-full"
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">{String(passwordErrors.newPassword?.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                {...registerPassword("confirmPassword")}
                className="w-full"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-600">{String(passwordErrors.confirmPassword?.message)}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
                className="w-full sm:w-auto rounded-full"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full sm:w-auto rounded-full">
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cover Image Upload Modal */}
      <Dialog open={isCoverUploadOpen} onOpenChange={setIsCoverUploadOpen}>
        <DialogContent className="max-w-md w-full mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Upload Cover Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 w-full">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition w-full"
              onClick={() => document.getElementById('cover-input')?.click()}
            >
              <ImageIcon size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload cover image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCoverImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setCoverImagePreview(event.target?.result as string);
                      setIsCropperOpen(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </div>
            {coverImagePreview && (
              <div className="w-full">
                <p className="text-sm font-medium mb-2">Cropped Preview:</p>
                <img src={coverImagePreview} alt="Cropped Preview" className="w-full rounded-lg" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCoverUploadOpen(false);
                  setCoverImageFile(null);
                  setCoverImagePreview(null);
                }}
                className="w-full sm:w-auto rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!coverImagePreview || uploadCoverImageMutation.isPending}
                onClick={() => {
                  if (coverImagePreview && currentMember) {
                    const base64 = coverImagePreview.split(',')[1];
                    uploadCoverImageMutation.mutate({
                      fileBase64: base64,
                      mimeType: "image/jpeg",
                      fileName: coverImageFile?.name || "cover-image.jpg",
                    });
                  }
                }}
                className="w-full sm:w-auto rounded-full"
              >
                {uploadCoverImageMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Modal */}
      {coverImagePreview && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={coverImagePreview}
          onCropComplete={(croppedImage) => {
            setCoverImagePreview(croppedImage);
            setIsCropperOpen(false);
          }}
          onCancel={() => {
            setIsCropperOpen(false);
            setCoverImageFile(null);
            setCoverImagePreview(null);
          }}
          aspectRatio={3}
          title="Crop Cover Image"
        />
      )}
    </div>
  );
}
