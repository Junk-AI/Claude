import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import ImageCropperModal from "@/components/ImageCropperModal";
import SocialMediaInput from "@/components/SocialMediaInput";
import PeopleWithCoursesInput from "@/components/PeopleWithCoursesInput";

const MEMBER_TYPES = [
  "Youth-led group",
  "Social service agency",
  "Community organisation",
  "Others",
];

const ISSUE_AREAS = [
  "Seniors",
  "Children",
  "Mental Health",
  "Environment",
  "Education",
  "Health & Wellbeing",
  "Community Development",
  "Technology & Innovation",
  "Arts & Culture",
  "Other",
];

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  initiativeName: z.string().optional(),
  country: z.string().optional(),
  memberType: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  website: z.string().url("Valid URL required").optional().or(z.literal("")),
  issueAreas: z.array(z.string()).optional(),
  customCause: z.string().optional(),
  social: z.array(z.object({
    platform: z.string().optional(),
    handle: z.string().optional(),
  })).optional(),
  peopleWithCourses: z.array(z.object({
    name: z.string().min(1, "Person name is required"),
    course: z.string().min(1, "Course is required"),
  })).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

interface AdminMemberEditProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMemberEdit({ member, isOpen, onClose }: AdminMemberEditProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(member?.coverImageUrl || null);
  const [coverImageKey, setCoverImageKey] = useState<string | null>(member?.coverImageKey || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: member?.name || "",
      initiativeName: member?.initiativeName || "",
      country: member?.country || "",
      memberType: member?.memberType || "",
      description: member?.description || "",
      email: member?.email || "",
      website: member?.website || "",
      issueAreas: member?.issueAreas ? JSON.parse(member.issueAreas) : [],
      customCause: member?.customCause || "",
      social: member?.social ? JSON.parse(member.social) : [],
      peopleWithCourses: member?.peopleWithCourses ? JSON.parse(member.peopleWithCourses) : [],
    },
  });

  const utils = trpc.useUtils();

  const updateMutation = trpc.members.update.useMutation({
    onSuccess: async () => {
      toast.success("Member updated successfully!");
      // Invalidate all member-related queries to refresh UI
      await Promise.all([
        utils.members.adminList.invalidate(),
        utils.members.list.invalidate(),
        utils.members.filterOptions.invalidate(),
        utils.members.spotlight.invalidate(),
      ]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update member");
    },
  });

  const uploadCoverMutation = trpc.members.uploadCoverImage.useMutation({
    onSuccess: () => {
      toast.success("Cover image uploaded!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload cover image");
    },
  });

  const issueAreas = watch("issueAreas") || [];

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setTempImageSrc(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setShowCropper(false);
    setTempImageSrc(null);
    
    // Check if image is too large (> 100KB) - if so, upload immediately
    if (croppedImage.length > 100000) {
      toast.info("Uploading cropped image...");
      setIsUploadingImage(true);
      
      try {
        // Extract base64 from data URL
        const base64 = croppedImage.split(',')[1];
        const result = await uploadCoverMutation.mutateAsync({
          fileBase64: base64,
          mimeType: 'image/jpeg',
          fileName: `cover-${Date.now()}.jpg`,
        });
        
        setCoverImagePreview(result.url);
        setCoverImageKey(result.key);
        toast.success("Image cropped and uploaded successfully!");
      } catch (err) {
        toast.error("Failed to upload cropped image");
        setCoverImagePreview(null);
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      // Small image - keep as preview for now, will upload on submit if needed
      setCoverImagePreview(croppedImage);
      toast.success("Image cropped successfully!");
    }
  };

  const onSubmit = async (data: EditFormData) => {
    const socialString = data.social && data.social.length > 0 
      ? JSON.stringify(data.social.filter(s => s.platform && s.handle))
      : undefined;
    const peopleWithCoursesString = data.peopleWithCourses && data.peopleWithCourses.length > 0
      ? JSON.stringify(data.peopleWithCourses)
      : undefined;
    
    let finalCoverImageUrl = coverImagePreview || undefined;
    let finalCoverImageKey = coverImageKey || undefined;
    
    // If coverImagePreview is a data URL (not already uploaded), upload it now
    if (finalCoverImageUrl && finalCoverImageUrl.startsWith('data:')) {
      if (finalCoverImageUrl.length > 100000) {
        toast.error("Image is too large. Please try a smaller image.");
        return;
      }
      
      try {
        setIsUploadingImage(true);
        const base64 = finalCoverImageUrl.split(',')[1];
        const result = await uploadCoverMutation.mutateAsync({
          fileBase64: base64,
          mimeType: 'image/jpeg',
          fileName: `cover-${Date.now()}.jpg`,
        });
        
        finalCoverImageUrl = result.url;
        finalCoverImageKey = result.key;
      } catch (err) {
        toast.error("Failed to upload cover image");
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }
    
    updateMutation.mutate({
      id: member.id,
      name: data.name,
      initiativeName: data.initiativeName,
      country: data.country,
      memberType: data.memberType,
      description: data.description,
      email: data.email,
      website: data.website,
      issueAreas: data.issueAreas?.length ? JSON.stringify(data.issueAreas) : undefined,
      customCause: data.customCause,
      social: socialString,
      peopleWithCourses: peopleWithCoursesString,
      coverImageUrl: finalCoverImageUrl,
      coverImageKey: finalCoverImageKey,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Member: {member?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cover Image Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Cover Image</Label>
            {coverImagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImagePreview(null);
                    setCoverImageKey(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Cover Image</span>
              <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
            </label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Name / Organisation *</Label>
            <Input {...register("name")} placeholder="Name" className="rounded-lg" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Initiative Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Initiative Name</Label>
            <Input {...register("initiativeName")} placeholder="Initiative name" className="rounded-lg" />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Country</Label>
            <Input {...register("country")} placeholder="Country" className="rounded-lg" />
          </div>

          {/* Member Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Member Type</Label>
            <Select onValueChange={(v) => setValue("memberType", v)} defaultValue={member?.memberType || ""}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Description</Label>
            <Textarea {...register("description")} placeholder="Tell us about your work..." className="rounded-lg min-h-24" />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Website</Label>
            <Input {...register("website")} placeholder="https://example.com" className="rounded-lg" />
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Email</Label>
            <Input type="email" {...register("email")} placeholder="your@email.com" className="rounded-lg" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Issue Areas */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Issue Areas (select all that apply)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-border rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer col-span-full font-semibold">
                <input
                  type="checkbox"
                  checked={(() => {
                    const areasExceptOther = ISSUE_AREAS.filter(a => a !== "Other");
                    return issueAreas.length === areasExceptOther.length && areasExceptOther.every(a => issueAreas.includes(a));
                  })()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValue("issueAreas", ISSUE_AREAS.filter(a => a !== "Other"));
                    } else {
                      setValue("issueAreas", []);
                    }
                  }}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">All Issue Areas (except Other)</span>
              </label>
              {ISSUE_AREAS.map((area) => (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("issueAreas", [...issueAreas, area]);
                      } else {
                        setValue("issueAreas", issueAreas.filter((a) => a !== area));
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Cause */}
          {issueAreas.includes("Other") && (
            <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
              <Label className="text-sm font-semibold">Please specify your cause</Label>
              <Input {...register("customCause")} placeholder="e.g., Migrant Workers, Refugees, etc." className="rounded-lg mt-2" />
            </div>
          )}

          {/* Social Media */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Social Media (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Add your social media handles</p>
            <SocialMediaInput register={register} watch={watch} setValue={setValue} />
          </div>

          {/* People & Courses */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">People & Courses (optional)</Label>
            <p className="text-xs text-muted-foreground mb-3">Add members of your organization and their courses</p>
            <PeopleWithCoursesInput control={watch} register={register} setValue={setValue} />
          </div>

          {/* Image Cropper */}
          {tempImageSrc && (
            <ImageCropperModal
              isOpen={showCropper}
              imageSrc={tempImageSrc}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setTempImageSrc(null);
              }}
              aspectRatio={3}
              title="Crop Cover Image (1200x400px)"
            />
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || isUploadingImage}>
              {updateMutation.isPending ? "Saving..." : isUploadingImage ? "Uploading image..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
