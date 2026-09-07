import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MemberProfileModal from "@/components/MemberProfileModal";
import PeopleWithCoursesInput from "@/components/PeopleWithCoursesInput";
import SocialMediaInput from "@/components/SocialMediaInput";
import ImageCropperModal from "@/components/ImageCropperModal";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import MemberAccountCreation from "@/components/MemberAccountCreation";
import {
  Users,
  MapPin,
  Search,
  Filter,
  Upload,
  UserPlus,
  X,
  CheckCircle,
  Globe,
  Mail,
  ExternalLink,
  Send,
} from "lucide-react";

// ─── Join Form Schema ─────────────────────────────────────────────────────────
const joinSchema = z.object({
  name: z.string().min(1, "Name/Organisation is required"),
  country: z.string().optional(),
  initiativeName: z.string().optional(),
  issueAreas: z.array(z.string()).optional(),
  customCause: z.string().optional(),
  memberType: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Please enter a valid email"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  social: z.array(z.object({
    platform: z.string().optional(),
    handle: z.string().optional(),
  })).optional(),
  peopleWithCourses: z.array(z.object({
    name: z.string().min(1, "Person name is required"),
    course: z.string().min(1, "Course is required"),
  })).optional(),
  pdpaConsent: z.boolean().refine((val) => val === true, "You must consent to data processing"),
  pdpaDataUsage: z.boolean().refine((val) => val === true, "You must consent to data usage"),
  pdpaMarketing: z.boolean().optional(),
  pdpaThirdParty: z.boolean().optional(),
});

type JoinFormData = z.infer<typeof joinSchema>;

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

const MEMBER_TYPES = [
  "Youth-led group",
  "Social service agency",
  "Community organisation",
  "Others",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// ─── Join Form ────────────────────────────────────────────────────────────────
function JoinForm() {
  // All state hooks must be declared at the top, before any conditional returns
  const [submitted, setSubmitted] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [newMemberId, setNewMemberId] = useState<number | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const joinMutation = trpc.members.join.useMutation({
    onSuccess: (data) => {
      setNewMemberId(data.id);
      setSubmitted(true);
      reset();
      toast.success("Organization approved! Now create your account.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    resolver: zodResolver(joinSchema),
  });

  const uploadMutation = trpc.members.uploadCoverImage.useMutation();
  
  const onSubmit = (data: JoinFormData) => {
    const socialString = data.social && data.social.length > 0 
      ? JSON.stringify(data.social.filter(s => s.platform && s.handle))
      : undefined;
    
    // Don't send large data URLs - only send if it's a reasonable size
    // If image is too large, skip it and let user upload via admin panel
    let coverImageUrl: string | undefined = undefined;
    let coverImageKey: string | undefined = undefined;
    
    if (coverImagePreview && coverImagePreview.length < 100000) {
      // Only include if reasonably sized (< 100KB)
      coverImageUrl = coverImagePreview;
      coverImageKey = coverImageFile?.name || undefined;
    } else if (coverImageFile) {
      // File is too large, show warning but allow submission
      toast.warning("Cover image is too large to include. You can add it later in your profile.");
    }
    
    const peopleWithCoursesString = data.peopleWithCourses && data.peopleWithCourses.length > 0
      ? JSON.stringify(data.peopleWithCourses)
      : undefined;
    
    joinMutation.mutate({
      name: data.name,
      country: data.country || undefined,
      issueAreas: data.issueAreas && data.issueAreas.length > 0 ? JSON.stringify(data.issueAreas) : undefined,
      customCause: data.customCause || undefined,
      memberType: data.memberType || undefined,
      description: data.description || undefined,
      email: data.email,
      website: data.website || undefined,
      social: socialString,
      peopleWithCourses: peopleWithCoursesString,
      coverImageUrl,
      coverImageKey,
      pdpaConsent: data.pdpaConsent,
      pdpaDataUsage: data.pdpaDataUsage,
      pdpaMarketing: data.pdpaMarketing || false,
      pdpaThirdParty: data.pdpaThirdParty || false,
    });
  };

  // Show account creation page after member details submitted
  if (submitted && !accountCreated && newMemberId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Welcome to the Network!</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Your organization has been approved. Now create your member account to access the portal and create events.
            </p>
          </div>
          <MemberAccountCreation onSuccess={() => setAccountCreated(true)} memberId={newMemberId} />
        </div>
      </div>
    );
  }

  // Show success after account created
  if (accountCreated) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">Account Created Successfully!</h3>
        <p className="text-muted-foreground text-sm mb-6">
          You can now log in to the Members Portal to create events and manage your organization.
        </p>
        <Button onClick={() => window.location.href = '/members-portal'} className="rounded-full">
          Go to Members Portal
        </Button>
      </div>
    );
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }
      
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setTempImageSrc(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setCoverImagePreview(croppedImage);
    setShowCropper(false);
    setTempImageSrc(null);
    toast.success("Image cropped successfully!");
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageSrc(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label className="text-sm font-semibold">Cover Image (optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">Upload a profile cover image (recommended: 1200x400px)</p>
        {coverImagePreview && (
          <div className="mb-3 rounded-xl overflow-hidden">
            <img src={coverImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="w-full rounded-xl border border-border p-2 text-sm"
        />
      </div>

      <div>
        <Label className="text-sm font-semibold">Name / Organisation Name *</Label>
        <Input placeholder="Your name or organisation" {...register("name")} className="rounded-xl mt-1" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label className="text-sm font-semibold">Country</Label>
        <Input placeholder="e.g. Singapore" {...register("country")} className="rounded-xl mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Issue Areas (select all that apply)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 border border-border rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer col-span-full font-semibold">
              <input
                type="checkbox"
                checked={(() => {
                  const selected = watch("issueAreas") || [];
                  const areasExceptOther = ISSUE_AREAS.filter(a => a !== "Other");
                  return selected.length === areasExceptOther.length && areasExceptOther.every(a => selected.includes(a));
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
            {ISSUE_AREAS.map((area) => {
              const selected = watch("issueAreas") || [];
              const isSelected = selected.includes(area);
              return (
                <label key={area} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("issueAreas", [...selected, area]);
                      } else {
                        setValue("issueAreas", selected.filter((a) => a !== area));
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              );
            })}
          </div>
          {(watch("issueAreas") || []).includes("Other") && (
            <div className="mt-3 p-3 bg-muted rounded-xl border border-border">
              <Label className="text-sm font-semibold">Please specify your cause</Label>
              <Input
                placeholder="e.g., Migrant Workers, Refugees, etc."
                {...register("customCause")}
                className="rounded-xl mt-2"
              />
            </div>
          )}
        </div>
        <div>
          <Label className="text-sm font-semibold">Member Type</Label>
          <Select onValueChange={(v) => setValue("memberType", v)}>
            <SelectTrigger className="rounded-xl mt-1">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {MEMBER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold">Tell us about your work</Label>
        <Textarea placeholder="What are you working on? What impact do you want to create?" {...register("description")} className="rounded-xl mt-1 min-h-24" />
      </div>

      <div>
        <Label className="text-sm font-semibold">Email *</Label>
        <Input type="email" placeholder="your@email.com" {...register("email")} className="rounded-xl mt-1" />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label className="text-sm font-semibold">Website (optional)</Label>
        <Input type="url" placeholder="https://yourwebsite.com" {...register("website")} className="rounded-xl mt-1" />
        {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>}
      </div>

      <div>
        <Label className="text-sm font-semibold">Social Media (optional)</Label>
        <p className="text-xs text-muted-foreground mb-2">Add your social media handles</p>
        <SocialMediaInput register={register} watch={watch} setValue={setValue} />
      </div>

      <div>
        <Label className="text-sm font-semibold">People & Courses (optional)</Label>
        <p className="text-xs text-muted-foreground mb-3">Add members of your organization and their courses</p>
        <PeopleWithCoursesInput control={watch} register={register} setValue={setValue} />
      </div>

      {/* PDPA Compliance Section */}
      <div className="border-t border-border pt-5 mt-5 space-y-3">
        <h4 className="font-semibold text-sm">Data Protection & Privacy</h4>
        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("pdpaConsent")}
              className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
            />
            <span className="text-xs text-foreground/70">
              I consent to Little But Loud processing my personal data in accordance with the{" "}
              <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              {" "}and{" "}
              <a href="/manage-data" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                Data Management
              </a>
            </span>
          </label>
          {errors.pdpaConsent && <p className="text-xs text-red-500 ml-6">{errors.pdpaConsent.message}</p>}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("pdpaDataUsage")}
              className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
            />
            <span className="text-xs text-foreground/70">
              I consent to my data being used for network communications and event updates
            </span>
          </label>
          {errors.pdpaDataUsage && <p className="text-xs text-red-500 ml-6">{errors.pdpaDataUsage.message}</p>}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("pdpaMarketing")}
              className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
            />
            <span className="text-xs text-foreground/70">
              I consent to receive marketing communications about opportunities and resources
            </span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("pdpaThirdParty")}
              className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
            />
            <span className="text-xs text-foreground/70">
              I consent to my data being shared with partner organizations for collaboration opportunities
            </span>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full font-semibold mt-5" disabled={joinMutation.isPending}>
        {joinMutation.isPending ? "Submitting..." : "Join the Network"}
      </Button>

      {tempImageSrc && (
        <ImageCropperModal
          isOpen={showCropper}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={3}
          title="Crop Cover Image (1200x400px)"
        />
      )}
    </form>
  );
}

// ─── Connection Request Modal ────────────────────────────────────────────────
function ConnectionRequestModal({ member, isOpen, onClose }: { member: any; isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(z.object({
      requesterName: z.string().min(1, "Name is required"),
      requesterEmail: z.string().email("Valid email required"),
      requesterOrganisation: z.string().optional(),
      message: z.string().optional(),
    })),
  });

  const connectionMutation = trpc.connectionRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Connection request sent!");
      reset();
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to send request"),
  });

  const onSubmit = (data: any) => {
    connectionMutation.mutate({
      toMemberId: member.id,
      requesterName: data.requesterName,
      requesterEmail: data.requesterEmail,
      requesterOrganisation: data.requesterOrganisation || undefined,
      message: data.message || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle>Connect with {member.name}</DialogTitle>
          <DialogDescription>
            Send a connection request to {member.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Your Name</Label>
            <Input placeholder="Your name" {...register("requesterName")} className="rounded-xl mt-1" />
            {errors.requesterName && <p className="text-xs text-red-500 mt-1">{errors.requesterName.message}</p>}
          </div>
          <div>
            <Label className="text-sm font-semibold">Your Email</Label>
            <Input type="email" placeholder="your@email.com" {...register("requesterEmail")} className="rounded-xl mt-1" />
            {errors.requesterEmail && <p className="text-xs text-red-500 mt-1">{errors.requesterEmail.message}</p>}
          </div>
          <div>
            <Label className="text-sm font-semibold">Your Organization (optional)</Label>
            <Input placeholder="Your organization" {...register("requesterOrganisation")} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Message (optional)</Label>
            <textarea placeholder="Tell them why you'd like to connect..." {...register("message")} className="w-full rounded-xl p-2 border border-border text-sm" rows={3} />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={connectionMutation.isPending}>
            {connectionMutation.isPending ? "Sending..." : "Send Connection Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CSV Upload ────────────────────────────────────────────────────────────────
function CSVUpload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const uploadMutation = trpc.members.bulkCreate.useMutation({
    onSuccess: () => {
      toast.success("Members uploaded successfully");
      utils.members.list.invalidate();
      utils.members.adminList.invalidate();
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e: any) => toast.error(e.message || "Upload failed"),
  });

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter((line) => line.trim());
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx] || undefined;
          });
          return obj;
        });
        uploadMutation.mutate(rows);
      } catch (err) {
        toast.error("Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
      <Button size="sm" variant="outline" className="rounded-full" onClick={() => fileRef.current?.click()}>
        <Upload className="w-3 h-3 mr-1" /> CSV Upload
      </Button>
    </>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
// ─── Connect Button Component ────────────────────────────────────────────────
function ConnectButton({ member, onOpenConnection }: { member: any; onOpenConnection?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenConnection) {
      onOpenConnection();
    }
    setIsOpen(true);
  };
  
  return (
    <>
      <Button
        className="w-full rounded-lg text-sm font-medium px-4 py-3"
        onClick={handleClick}
      >
        🤝 Connect
      </Button>
      <ConnectionRequestModal member={member} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

function MemberCard({ member }: { member: any }) {
  const [showProfile, setShowProfile] = useState(false);
  
  return (
    <>
      <motion.div variants={itemVariants}>
        <Card
          className="card-lift rounded-2xl border-0 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden h-full flex flex-col"
        >
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Cover Image */}
        <div className="mb-0 relative bg-gradient-to-br from-primary/20 to-pink-50 flex items-center justify-center overflow-hidden w-full" style={{ aspectRatio: "3/1" }}>
          {member.coverImageUrl && (
            <img 
              src={member.coverImageUrl} 
              alt={member.name} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.error(`[MemberCard] Failed to load cover image for ${member.name}: ${member.coverImageUrl}`);
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log(`[MemberCard] Successfully loaded cover image for ${member.name}`);
              }}
            />
          )}
          {!member.coverImageUrl && (
            <span className="font-display text-6xl sm:text-7xl md:text-8xl font-bold text-primary">{member.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">


          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-1">{member.name}</h3>
          {member.memberType && (
            <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: "var(--brand-purple)" }}>
              {member.memberType}
            </p>
          )}
          {member.country && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" /> {member.country}
            </p>
          )}
          {member.description && (
            <p className="text-xs sm:text-sm text-foreground/60 line-clamp-2">{member.description}</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 px-4 sm:px-5 md:px-6 pb-4 border-t border-border flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setShowProfile(true)}
            className="flex-1 px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            👁️ More details
          </button>
          <div className="flex-1">
            <ConnectButton member={member} onOpenConnection={() => setShowProfile(false)} />
          </div>
        </div>
      </CardContent>
        </Card>
      </motion.div>
    <MemberProfileModal member={member} isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}

// ─── Connect Page ─────────────────────────────────────────────────────────────
export default function Connect() {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";
  const [joinOpen, setJoinOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ country: "", issueArea: "", memberType: "" });
  const [location] = useLocation();
  // Note: useLocation from Wouter only gives us the path, not query params
  // We use window.location.search for query parameter parsing
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const { data: members = [], isLoading } = trpc.members.list.useQuery();
  const { data: filterOptions } = trpc.members.filterOptions.useQuery();

  // Handle member query parameter from URL
  useEffect(() => {
    // Wouter's useLocation returns just the path, we need to use window.location for query params
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const memberId = params.get('member');
    console.log('[Connect] URL location:', location);
    console.log('[Connect] Query string:', queryString);
    console.log('[Connect] Parsed memberId:', memberId);
    if (memberId) {
      const parsedId = parseInt(memberId, 10).toString();
      console.log('[Connect] Setting selectedMemberId:', parsedId);
      setSelectedMemberId(parsedId);
      setShowMemberModal(true);
    }
  }, [location]);

  const hasFilters = filters.country || filters.issueArea || filters.memberType;
  const clearFilters = () => { setFilters({ country: "", issueArea: "", memberType: "" }); setSearch(""); };

  const filtered = members.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()) || m.country?.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filters.country || m.country === filters.country;
    const memberAreas = m.issueAreas ? JSON.parse(m.issueAreas) : [];
    const matchArea = !filters.issueArea || memberAreas.includes(filters.issueArea);
    const matchType = !filters.memberType || m.memberType === filters.memberType;
    return matchSearch && matchCountry && matchArea && matchType;
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-hero py-14 md:py-20">
        <div className="container">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Connect
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Member Directory
            </h1>
            <p className="text-foreground/70 text-lg leading-relaxed">
              Discover young changemakers and organisations working on impact in Singapore. Connect, collaborate, and grow together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Explore Members Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold mb-1">Explore Members</h2>
              <p className="text-muted-foreground text-sm">{filtered.length} member{filtered.length !== 1 ? "s" : ""} found</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full">
                        <UserPlus className="w-3 h-3 mr-1" /> Add Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-xl">
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Add Group / Member</DialogTitle>
                      </DialogHeader>
                      <JoinForm />
                    </DialogContent>
                  </Dialog>
                  <CSVUpload />
                </>
              )}
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, initiative, or location..."
                className="pl-9 rounded-xl bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filters.country || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, country: v === "all" ? "" : v }))}>
                <SelectTrigger className="w-36 rounded-xl bg-white text-sm">
                  <Globe className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {filterOptions?.countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.issueArea || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, issueArea: v === "all" ? "" : v }))}>
                <SelectTrigger className="w-40 rounded-xl bg-white text-sm">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Issue Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issue Areas</SelectItem>
                  {filterOptions?.issueAreas && filterOptions.issueAreas.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.memberType || "all"} onValueChange={(v) => setFilters((f) => ({ ...f, memberType: v === "all" ? "" : v }))}>
                <SelectTrigger className="w-36 rounded-xl bg-white text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions?.memberTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl text-muted-foreground">
                  <X className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white border-0 shadow-sm">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">No members found.</p>
              {hasFilters && (
                <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {filtered.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Join Section */}
      <section className="py-16" style={{ background: "oklch(97% 0.02 240)" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Join the Network</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Are you a young changemaker or organisation working on impact in Singapore? Join our network and connect with others.
              </p>
              <Card className="rounded-2xl border-0 shadow-sm bg-white">
                <CardContent className="p-6 sm:p-8 md:p-10">
                  <JoinForm />
                </CardContent>
              </Card>
            </div>
            <div className="lg:pt-12 pt-8">
              <div className="rounded-3xl p-6 sm:p-8 text-white" style={{ background: "linear-gradient(135deg, oklch(72% 0.20 50), oklch(72% 0.22 355))" }}>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-4">Why Join?</h3>
                <ul className="space-y-4">
                  {[
                    { step: "1", text: "Connect with other youth changemakers and organisations in Singapore" },
                    { step: "2", text: "Find collaboration opportunities and expand your network" },
                    { step: "3", text: "Access resources and tools to amplify your impact" },
                    { step: "4", text: "Be featured in our member spotlight and share your story" },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex items-start gap-3 text-white/90 text-sm">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        {step}
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Profile Modal - opened from URL query parameter */}
      {selectedMemberId && (
        <MemberProfileModal
          member={members.find(m => m.id === parseInt(selectedMemberId, 10)) || null}
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false);
            setSelectedMemberId(null);
          }}
        />
      )}
    </div>
  );
}
