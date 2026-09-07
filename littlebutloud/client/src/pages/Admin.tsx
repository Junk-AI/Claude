import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { buildEventShareUrl } from "@/lib/eventLinks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AdminEmailExport from "@/components/AdminEmailExport";
import AdminMemberEdit from "@/components/AdminMemberEdit";
import AdminEventManagement from "./AdminEventManagement";
import AdminEventRegistrationManager from "@/components/AdminEventRegistrationManager";
import AdminMemberAccountManagement from "@/components/AdminMemberAccountManagement";
import MemberAccountSigninDetails from "@/components/MemberAccountSigninDetails";
import {
  Users,
  Handshake,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Star,
  StarOff,
  Upload,
  Plus,
  Image as ImageIcon,
  Copy,
  Shield,
  Lock,
  Mail,
} from "lucide-react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "approved" ? "bg-green-100 text-green-800 border border-green-200" :
    status === "pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
    status === "rejected" ? "bg-red-100 text-red-800 border border-red-200" :
    "bg-gray-100 text-gray-800 border border-gray-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls}`}>{status}</span>;
}

// ─── Image Upload Helper ──────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Members Tab ──────────────────────────────────────────────────────────────
function MembersTab() {
  const utils = trpc.useUtils();
  const { data: members = [], isLoading } = trpc.members.adminList.useQuery();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'members' | 'accounts'>('members');
  const photoRef = useRef<HTMLInputElement>(null);

  const updateMutation = trpc.members.update.useMutation({
    onSuccess: () => { toast.success("Member updated"); utils.members.adminList.invalidate(); utils.members.list.invalidate(); utils.members.spotlight.invalidate(); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.members.delete.useMutation({
    onSuccess: () => { toast.success("Member deleted"); utils.members.adminList.invalidate(); utils.members.list.invalidate(); utils.members.spotlight.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const uploadPhotoMutation = trpc.members.uploadPhoto.useMutation({
    onSuccess: () => { toast.success("Photo uploaded"); utils.members.adminList.invalidate(); utils.members.list.invalidate(); utils.members.spotlight.invalidate(); setUploadingId(null); },
    onError: (e) => { toast.error(e.message); setUploadingId(null); },
  });

  const handleApprove = (id: number) => updateMutation.mutate({ id, status: "approved" });
  const handleReject = (id: number) => updateMutation.mutate({ id, status: "rejected" });
  const handleDelete = (id: number) => { if (confirm("Delete this member?")) deleteMutation.mutate({ id }); };
  const handleSpotlight = (id: number, current: boolean) => updateMutation.mutate({ id, eligibleForSpotlight: !current });

  const handlePhotoUpload = async (memberId: number, file: File) => {
    setUploadingId(memberId);
    const fileBase64 = await fileToBase64(file);
    uploadPhotoMutation.mutate({ memberId, fileBase64, mimeType: file.type, fileName: file.name });
  };

  const toggleMemberSelection = (id: number) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = (memberList: any[]) => {
    if (selectedMembers.size === memberList.length && memberList.every(m => selectedMembers.has(m.id))) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(memberList.map(m => m.id)));
    }
  };

  const handleGenerateEmails = () => {
    const selectedMembersList = members.filter(m => selectedMembers.has(m.id));
    const emails = selectedMembersList.map(m => m.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${selectedMembersList.length} email(s) to clipboard`);
  };

  const handleBulkDelete = () => {
    if (selectedMembers.size === 0) {
      toast.error("No members selected");
      return;
    }
    if (confirm(`Delete ${selectedMembers.size} member(s)? This cannot be undone.`)) {
      selectedMembers.forEach(id => {
        deleteMutation.mutate({ id });
      });
      setSelectedMembers(new Set());
    }
  };

  const handleBulkStar = (star: boolean) => {
    if (selectedMembers.size === 0) {
      toast.error("No members selected");
      return;
    }
    selectedMembers.forEach(id => {
      updateMutation.mutate({ id, eligibleForSpotlight: star });
    });
    setSelectedMembers(new Set());
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading members...</div>;

  const pending = members.filter((m) => m.status === "pending");
  const approved = members.filter((m) => m.status === "approved");
  const rejected = members.filter((m) => m.status === "rejected");
  const showBulkActions = selectedMembers.size > 0;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Member Management
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'accounts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Account Sign-in Details
        </button>
      </div>

      {/* Members Management Tab */}
      {activeTab === 'members' && (
        <>
          {/* Bulk Actions Toolbar */}
          {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-semibold text-blue-900">
            {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs flex-1 sm:flex-none gap-1"
              onClick={handleGenerateEmails}
            >
              <Mail className="w-3 h-3" />
              Copy Emails
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs flex-1 sm:flex-none gap-1"
              onClick={() => handleBulkStar(true)}
            >
              <Star className="w-3 h-3" />
              Star
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs flex-1 sm:flex-none gap-1"
              onClick={() => handleBulkStar(false)}
            >
              <StarOff className="w-3 h-3" />
              Unstar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full text-xs flex-1 sm:flex-none gap-1"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-xs"
              onClick={() => setSelectedMembers(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs text-white font-bold">{pending.length}</span>
              Pending Approval
            </h3>
            <input
              type="checkbox"
              checked={pending.length > 0 && pending.every(m => selectedMembers.has(m.id))}
              onChange={() => toggleSelectAll(pending)}
              className="w-4 h-4 rounded cursor-pointer"
              title="Select all pending members"
            />
          </div>
          <div className="space-y-3">
            {pending.map((m) => (
              <Card key={m.id} className={`rounded-2xl border ${selectedMembers.has(m.id) ? 'border-blue-500 bg-blue-50' : 'border-yellow-200 bg-yellow-50/50'}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(m.id)}
                        onChange={() => toggleMemberSelection(m.id)}
                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{m.name}</span>
                          <StatusBadge status={m.status} />
                        </div>
                        {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                      </div>
                    </div>
                      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                      <Button size="sm" className="rounded-full text-xs bg-green-600 hover:bg-green-700 flex-1 sm:flex-none" onClick={() => handleApprove(m.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full text-xs border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-none" onClick={() => handleReject(m.id)}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-base">Approved Members ({approved.length})</h3>
          <input
            type="checkbox"
            checked={approved.length > 0 && approved.every(m => selectedMembers.has(m.id))}
            onChange={() => toggleSelectAll(approved)}
            className="w-4 h-4 rounded cursor-pointer"
            title="Select all approved members"
          />
        </div>
        <div className="space-y-2">
          {approved.map((m) => (
            <Card key={m.id} className={`rounded-xl border-0 shadow-sm ${selectedMembers.has(m.id) ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(m.id)}
                      onChange={() => toggleMemberSelection(m.id)}
                      className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                    />
                    {m.coverImageUrl ? (
                      <img src={m.coverImageUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary text-sm">{m.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{m.name}</span>
                        {m.eligibleForSpotlight && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-xs"
                      title="Edit member"
                      onClick={() => { setEditingMember(m); setShowEditDialog(true); }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-xs"
                      title={m.eligibleForSpotlight ? "Remove from spotlight" : "Add to spotlight"}
                      onClick={() => handleSpotlight(m.id, m.eligibleForSpotlight)}
                    >
                      {m.eligibleForSpotlight ? <StarOff className="w-3 h-3 text-yellow-500" /> : <Star className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {approved.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No approved members yet.</p>}
        </div>
      </div>

      {/* Admin Member Edit Dialog */}
      {editingMember && (
        <AdminMemberEdit
          member={editingMember}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingMember(null);
            utils.members.adminList.invalidate();
            utils.members.list.invalidate();
            utils.members.spotlight.invalidate();
          }}
        />
      )}

      {/* Hidden photo input */}
      <input
        ref={photoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const id = parseInt(photoRef.current?.getAttribute("data-id") || "0");
          if (file && id) handlePhotoUpload(id, file);
          e.target.value = "";
        }}
      />

      {rejected.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base text-muted-foreground">Rejected ({rejected.length})</h3>
            <input
              type="checkbox"
              checked={rejected.length > 0 && rejected.every(m => selectedMembers.has(m.id))}
              onChange={() => toggleSelectAll(rejected)}
              className="w-4 h-4 rounded cursor-pointer"
              title="Select all rejected members"
            />
          </div>
          <div className="space-y-2">
            {rejected.map((m) => (
              <Card key={m.id} className={`rounded-xl border-0 shadow-sm ${selectedMembers.has(m.id) ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white opacity-60'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(m.id)}
                        onChange={() => toggleMemberSelection(m.id)}
                        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{m.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" className="rounded-full text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(m.id)}>Re-approve</Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {/* Account Sign-in Details Tab */}
      {activeTab === 'accounts' && (
        <MemberAccountSigninDetails members={members} />
      )}
    </div>
  );
}

// ─── Collaborations Tab ───────────────────────────────────────────────────────
function CollaborationsTab() {
  const utils = trpc.useUtils();
  const { data: collabs = [], isLoading } = trpc.collaborations.adminList.useQuery();

  const updateMutation = trpc.collaborations.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.collaborations.adminList.invalidate(); utils.collaborations.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.collaborations.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.collaborations.adminList.invalidate(); utils.collaborations.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  const pending = collabs.filter((c) => c.status === "pending");
  const approved = collabs.filter((c) => c.status === "approved");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs text-white font-bold">{pending.length}</span>
            Pending Approval
          </h3>
          <div className="space-y-3">
            {pending.map((c) => (
              <Card key={c.id} className="rounded-2xl border border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{c.title}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      {c.contactEmail && <p className="text-xs text-muted-foreground mt-0.5">{c.contactName} · {c.contactEmail}</p>}
                      {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                      <Button size="sm" className="rounded-full text-xs bg-green-600 hover:bg-green-700 flex-1 sm:flex-none" onClick={() => updateMutation.mutate({ id: c.id, status: "approved" })}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full text-xs border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-none" onClick={() => updateMutation.mutate({ id: c.id, status: "rejected" })}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: c.id }); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-display font-bold text-base mb-3">Approved ({approved.length})</h3>
        <div className="space-y-2">
          {approved.map((c) => (
            <Card key={c.id} className="rounded-xl border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{c.title}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: c.id }); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {approved.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No approved collaborations.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
function EventsTab() {
  const utils = trpc.useUtils();
  const { data: events = [], isLoading } = trpc.events.adminList.useQuery();
  const { data: pastEvents = [], isLoading: loadingPast } = trpc.pastEvents.adminList.useQuery();
  const [addPastOpen, setAddPastOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [signupDetailsOpen, setSignupDetailsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [uploadingPastId, setUploadingPastId] = useState<number | null>(null);
  const [editPhotosOpen, setEditPhotosOpen] = useState(false);
  const [editingPastEventId, setEditingPastEventId] = useState<number | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);
  const [uploadingEventCoverId, setUploadingEventCoverId] = useState<number | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const existingEventCoverRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const copyEventLink = async (eventId: number) => {
    const eventUrl = buildEventShareUrl(window.location.origin, eventId);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(eventUrl);
      } else {
        const fallback = document.createElement("textarea");
        fallback.value = eventUrl;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(fallback);
        if (!copied) throw new Error("Clipboard access unavailable");
      }
      setCopiedEventId(eventId);
      toast.success("Event link copied");
    } catch {
      toast.error("Could not copy the event link. Please enable clipboard access and try again.");
    }
  };

  const [eventCoverFile, setEventCoverFile] = useState<File | null>(null);
  const eventCoverRef = useRef<HTMLInputElement>(null);
  
  const eventSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    eventDate: z.string().min(1),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    capacityLimit: z.coerce.number().optional(),
    organiser: z.string().optional(),
    contactEmail: z.string().email().optional(),
    adminNotes: z.string().optional(),
  });
  const { register: registerEvent, handleSubmit: handleEventSubmit, reset: resetEvent } = useForm({ resolver: zodResolver(eventSchema) });
  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => { toast.success("Event created"); utils.events.adminList.invalidate(); utils.events.upcoming.invalidate(); setAddEventOpen(false); resetEvent(); },
    onError: (e) => toast.error(e.message),
  });
  const uploadEventCoverMutation = trpc.events.uploadCoverImage.useMutation();

  const updateExistingEventCover = async (eventId: number, file: File) => {
    setUploadingEventCoverId(eventId);
    try {
      const fileBase64 = await fileToBase64(file);
      const uploaded = await uploadEventCoverMutation.mutateAsync({
        fileBase64,
        mimeType: file.type,
        fileName: file.name,
      });
      await updateEventMutation.mutateAsync({
        id: eventId,
        coverImageUrl: uploaded.url,
        coverImageKey: uploaded.key,
      });
      toast.success("Event cover image updated");
    } catch (error: any) {
      toast.error(error.message || "Could not upload the event cover image.");
    } finally {
      setUploadingEventCoverId(null);
    }
  };

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => { toast.success("Event updated"); utils.events.adminList.invalidate(); utils.events.upcoming.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => { toast.success("Event deleted"); utils.events.adminList.invalidate(); utils.events.upcoming.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const createPastMutation = trpc.pastEvents.create.useMutation({
    onSuccess: () => { toast.success("Past event created"); utils.pastEvents.list.invalidate(); utils.pastEvents.adminList.invalidate(); setAddPastOpen(false); resetPast(); },
    onError: (e) => toast.error(e.message),
  });

  const deletePastMutation = trpc.pastEvents.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.pastEvents.list.invalidate(); utils.pastEvents.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const uploadImageMutation = trpc.pastEvents.uploadImage.useMutation({
    onSuccess: () => { toast.success("Image uploaded"); utils.pastEvents.list.invalidate(); utils.pastEvents.adminList.invalidate(); setUploadingPastId(null); },
    onError: (e) => { toast.error(e.message); setUploadingPastId(null); },
  });

  const updatePhotosUrlMutation = trpc.pastEvents.update.useMutation({
    onSuccess: () => { toast.success("Photos settings updated"); utils.pastEvents.list.invalidate(); utils.pastEvents.adminList.invalidate(); setEditPhotosOpen(false); setEditingPastEventId(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteImageMutation = trpc.pastEvents.deleteImage.useMutation({
    onSuccess: () => { toast.success("Image deleted"); utils.pastEvents.list.invalidate(); utils.pastEvents.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const pastSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    eventDate: z.string().optional(),
    location: z.string().optional(),
    organiser: z.string().optional(),
    participants: z.string().optional(),
    photosUrl: z.string().url().optional().or(z.literal("")),
    photosPassword: z.string().min(4, "Use at least 4 characters").max(100).optional().or(z.literal("")),
  });

  const { register: registerPast, handleSubmit: handlePastSubmit, reset: resetPast } = useForm({ resolver: zodResolver(pastSchema) });

  const handleGalleryUpload = async (pastEventId: number, file: File) => {
    setUploadingPastId(pastEventId);
    const fileBase64 = await fileToBase64(file);
    uploadImageMutation.mutate({ pastEventId, fileBase64, mimeType: file.type, fileName: file.name });
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-base">Upcoming Events ({events.filter(e => e.status === "upcoming").length})</h3>
          <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Create Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEventSubmit(async (data: any) => {
                let coverImageUrl = "";
                let coverImageKey = "";
                if (eventCoverFile) {
                  const base64 = await fileToBase64(eventCoverFile);
                  const uploaded = await uploadEventCoverMutation.mutateAsync({
                    fileBase64: base64,
                    mimeType: eventCoverFile.type,
                    fileName: eventCoverFile.name,
                  });
                  coverImageUrl = uploaded.url;
                  coverImageKey = uploaded.key;
                }
                createEventMutation.mutate({ ...data, eventDate: new Date(data.eventDate), coverImageUrl, coverImageKey });
              })} className="space-y-4">
                <div>
                  <Label className="font-semibold">Title *</Label>
                  <Input placeholder="Event title" className="mt-1 rounded-xl" {...registerEvent("title")} />
                </div>
                <div>
                  <Label className="font-semibold">Cover Image</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={eventCoverRef}
                      onChange={(e) => setEventCoverFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => eventCoverRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      {eventCoverFile ? eventCoverFile.name : "Choose Image"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-semibold">Date *</Label>
                    <Input type="datetime-local" className="mt-1 rounded-xl" {...registerEvent("eventDate")} />
                  </div>
                  <div>
                    <Label className="font-semibold">Capacity Limit</Label>
                    <Input type="number" placeholder="Max participants" className="mt-1 rounded-xl" {...registerEvent("capacityLimit")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-semibold">Start Time</Label>
                    <Input type="time" className="mt-1 rounded-xl" {...registerEvent("startTime")} />
                  </div>
                  <div>
                    <Label className="font-semibold">End Time</Label>
                    <Input type="time" className="mt-1 rounded-xl" {...registerEvent("endTime")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-semibold">Organiser</Label>
                    <Input placeholder="Organiser" className="mt-1 rounded-xl" {...registerEvent("organiser")} />
                  </div>
                  <div>
                    <Label className="font-semibold">Contact Email</Label>
                    <Input type="email" placeholder="contact@example.com" className="mt-1 rounded-xl" {...registerEvent("contactEmail")} />
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Description</Label>
                  <Textarea placeholder="Event description..." className="mt-1 rounded-xl" {...registerEvent("description")} />
                </div>
                <div>
                  <Label className="font-semibold">Admin Notes</Label>
                  <Textarea placeholder="Internal notes for admins..." className="mt-1 rounded-xl" {...registerEvent("adminNotes")} />
                </div>
                <Button type="submit" className="w-full rounded-full" disabled={createEventMutation.isPending || uploadEventCoverMutation.isPending}>
                  {uploadEventCoverMutation.isPending ? "Uploading image..." : createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-2">
          {events.filter(e => e.status === "upcoming").map((e) => (
            <Card key={e.id} className="rounded-xl border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{e.title}</span>
                    {e.coverImageUrl && (
                      <img
                        src={e.coverImageUrl}
                        alt={`Cover for ${e.title}`}
                        className="mt-2 h-20 w-full max-w-xs rounded-lg object-cover"
                      />
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {e.startTime && e.endTime && (
                        <span>{e.startTime} - {e.endTime}</span>
                      )}
                      {e.capacityLimit && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Capacity: {e.capacityLimit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
                    <input
                      ref={(node) => { existingEventCoverRefs.current[e.id] = node; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void updateExistingEventCover(e.id, file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs flex-1 sm:flex-none"
                      onClick={() => existingEventCoverRefs.current[e.id]?.click()}
                      disabled={uploadingEventCoverId === e.id}
                      aria-label={`${e.coverImageUrl ? "Replace" : "Upload"} cover image for ${e.title}`}
                    >
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {uploadingEventCoverId === e.id ? "Uploading..." : e.coverImageUrl ? "Replace Cover" : "Upload Cover"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs flex-1 sm:flex-none"
                      onClick={() => copyEventLink(e.id)}
                      aria-label={`Copy a shareable link for ${e.title}`}
                    >
                      <Copy className="w-3 h-3 mr-1" /> {copiedEventId === e.id ? "Link Copied" : "Copy Event Link"}
                    </Button>
                    <Button size="sm" className="rounded-full text-xs flex-1 sm:flex-none" onClick={() => { setSelectedEventId(e.id); setSignupDetailsOpen(true); }}>
                      👥 Manage Responses
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full text-xs flex-1 sm:flex-none" onClick={() => updateEventMutation.mutate({ id: e.id, status: "past" })}>
                      ✓ Mark Past
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => { if (confirm("Delete event?")) deleteEventMutation.mutate({ id: e.id } as any); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {events.filter(e => e.status === "upcoming").length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events.</p>}
        </div>
      </div>

      {/* Past Events Gallery Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-base">Past Events Gallery ({pastEvents.length})</h3>
          <Dialog open={addPastOpen} onOpenChange={setAddPastOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Past Event
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Add Past Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePastSubmit((data: any) => createPastMutation.mutate({ ...data, eventDate: data.eventDate ? new Date(data.eventDate) : undefined }))} className="space-y-4">
                <div>
                  <Label className="font-semibold">Title *</Label>
                  <Input placeholder="Event title" className="mt-1 rounded-xl" {...registerPast("title")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-semibold">Date</Label>
                    <Input type="date" className="mt-1 rounded-xl" {...registerPast("eventDate")} />
                  </div>
                  <div>
                    <Label className="font-semibold">Location</Label>
                    <Input placeholder="Event location" className="mt-1 rounded-xl" {...registerPast("location")} />
                  </div>
                </div>
              <div>
                <Label className="font-semibold">Organiser</Label>
                <Input placeholder="Organiser" className="mt-1 rounded-xl" {...registerPast("organiser")} />
              </div>
              <div>
                <Label className="font-semibold">Participants</Label>
                <Input placeholder="e.g. 50 youth participants" className="mt-1 rounded-xl" {...registerPast("participants")} />
              </div>
              <div>
                <Label className="font-semibold">Description</Label>
                <Textarea placeholder="Event description..." className="mt-1 rounded-xl" {...registerPast("description")} />
              </div>
              <div>
                <Label className="font-semibold">Photos Link (Google Drive or External)</Label>
                <Input type="url" placeholder="https://drive.google.com/..." className="mt-1 rounded-xl" {...registerPast("photosUrl")} />
                <p className="text-xs text-muted-foreground mt-1">Link to Google Drive folder or external album with event photos</p>
              </div>
              <div>
                <Label className="font-semibold">Photos Password (optional)</Label>
                <Input type="password" autoComplete="new-password" placeholder="Set a password to protect the photos link" className="mt-1 rounded-xl" {...registerPast("photosPassword")} />
                <p className="text-xs text-muted-foreground mt-1">Visitors must enter this password before the photos link opens.</p>
              </div>
                <Button type="submit" className="w-full rounded-full" disabled={createPastMutation.isPending}>
                  {createPastMutation.isPending ? "Creating..." : "Create Past Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {pastEvents.map((pe: any) => (
            <Card key={pe.id} className="rounded-xl border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-semibold text-sm">{pe.title}</span>
                    {pe.eventDate && <span className="text-xs text-muted-foreground ml-2">{new Date(pe.eventDate).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      disabled={uploadingPastId === pe.id}
                      onClick={() => { galleryRef.current?.setAttribute("data-id", String(pe.id)); galleryRef.current?.click(); }}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {uploadingPastId === pe.id ? "Uploading..." : "Add Photo"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      onClick={() => { setEditingPastEventId(pe.id); setEditPhotosOpen(true); }}
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Photos & Password
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => { if (confirm("Delete?")) deletePastMutation.mutate({ id: pe.id }); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {pe.images && pe.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {pe.images.map((img: any) => (
                      <div key={img.id} className="relative group">
                        <img src={img.imageUrl} alt={img.caption || "Event photo"} className="w-16 h-16 rounded-lg object-cover" />
                        <button
                          onClick={() => { if (confirm("Delete photo?")) deleteImageMutation.mutate({ id: img.id }); }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {pastEvents.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No past events yet.</p>}
        </div>
      </div>

      {/* Edit Photos Link Dialog */}
      <Dialog open={editPhotosOpen} onOpenChange={setEditPhotosOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Photos Link</DialogTitle>
          </DialogHeader>
          {editingPastEventId && (() => {
            const event = pastEvents.find(e => e.id === editingPastEventId);
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const photosUrl = formData.get("photosUrl") as string;
                  const photosPassword = formData.get("photosPassword") as string;
                  const clearPhotosPassword = formData.get("clearPhotosPassword") === "on";
                  updatePhotosUrlMutation.mutate({
                    id: editingPastEventId,
                    photosUrl: photosUrl || undefined,
                    photosPassword: photosPassword || undefined,
                    clearPhotosPassword,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm font-semibold mb-2">Event: {event?.title}</p>
                </div>
                <div>
                  <Label className="font-semibold">Photos Link (Google Drive or External)</Label>
                  <Input
                    type="url"
                    name="photosUrl"
                    placeholder="https://drive.google.com/..."
                    defaultValue={event?.photosUrl || ""}
                    className="mt-1 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Link to Google Drive folder or external album with event photos</p>
                </div>
                <div>
                  <Label className="font-semibold">Set a New Photos Password</Label>
                  <Input
                    type="password"
                    name="photosPassword"
                    autoComplete="new-password"
                    minLength={4}
                    maxLength={100}
                    placeholder={event?.photosPassword ? "Leave blank to keep the existing password" : "Optional: protect this link with a password"}
                    className="mt-1 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Passwords are stored securely. Use at least 4 characters.</p>
                </div>
                {event?.photosPassword && (
                  <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" name="clearPhotosPassword" className="mt-0.5" />
                    Remove the existing password so anyone can open the photos link.
                  </label>
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEditPhotosOpen(false);
                      setEditingPastEventId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full" disabled={updatePhotosUrlMutation.isPending}>
                    {updatePhotosUrlMutation.isPending ? "Saving..." : "Save Link"}
                  </Button>
                </div>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Event registration management */}
      <Dialog open={signupDetailsOpen} onOpenChange={setSignupDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl max-w-6xl">
          <DialogHeader>
            <DialogTitle className="font-display">Event registration management</DialogTitle>
          </DialogHeader>
          {selectedEventId && <AdminEventRegistrationManager event={events.find((event) => event.id === selectedEventId)} />}
        </DialogContent>
      </Dialog>

      {/* Hidden gallery input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const id = parseInt(galleryRef.current?.getAttribute("data-id") || "0");
          if (file && id) handleGalleryUpload(id, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────
function ResourcesTab() {
  const utils = trpc.useUtils();
  const { data: resources = [], isLoading } = trpc.resources.adminList.useQuery();
  const [addOpen, setAddOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>("");

  const createMutation = trpc.resources.create.useMutation({
    onSuccess: () => { toast.success("Resource created"); utils.resources.adminList.invalidate(); utils.resources.list.invalidate(); utils.resources.featured.invalidate(); setAddOpen(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.resources.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.resources.adminList.invalidate(); utils.resources.list.invalidate(); utils.resources.featured.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.resources.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); utils.resources.adminList.invalidate(); utils.resources.list.invalidate(); utils.resources.featured.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const uploadFileMutation = trpc.resources.uploadFile.useMutation({
    onSuccess: () => { toast.success("File uploaded"); utils.resources.adminList.invalidate(); setUploadingId(null); },
    onError: (e) => { toast.error(e.message); setUploadingId(null); },
  });

  const resSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    resourceType: z.string().optional(),
    link: z.string().optional(),
    featured: z.boolean().default(false),
  }).refine(
    (data) => data.link || uploadFile,
    { message: "Either a link or file must be provided", path: ["link"] }
  );

  const { register: registerRes, handleSubmit: handleResSubmit, reset: resetForm, setValue: setResValue } = useForm({ resolver: zodResolver(resSchema) });

  const handleFileUpload = async (resourceId: number, file: File) => {
    setUploadingId(resourceId);
    const fileBase64 = await fileToBase64(file);
    uploadFileMutation.mutate({ resourceId, fileBase64, mimeType: file.type, fileName: file.name });
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Plus className="w-3 h-3 mr-1" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Add Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResSubmit((data: any) => {
              createMutation.mutate({ ...data, link: data.link || undefined });
              setUploadFile(null);
              setUploadFileName("");
            })} className="space-y-4">
              <div>
                <Label className="font-semibold">Title *</Label>
                <Input placeholder="Resource title" className="mt-1 rounded-xl" {...registerRes("title")} />
              </div>
              <div>
                <Label className="font-semibold">Description</Label>
                <Textarea placeholder="Description..." className="mt-1 rounded-xl" {...registerRes("description")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-semibold">Type</Label>
                  <Select onValueChange={(v) => setResValue("resourceType", v)}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Toolkits", "Reports", "Articles", "Case Studies"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" {...registerRes("featured")} />
                    <span className="text-sm font-semibold">Featured</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Link (URL) or File Upload</Label>
                <div className="space-y-2">
                  <Input placeholder="https://..." className="mt-1 rounded-xl" {...registerRes("link")} />
                  <div className="text-xs text-muted-foreground text-center">OR</div>
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">{uploadFileName || "Click to upload file"}</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFile(file);
                        setUploadFileName(file.name);
                        setResValue("link", "");
                      }
                    }}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Resource"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {resources.map((r) => (
          <Card key={r.id} className="rounded-xl border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.title}</span>
                    {r.resourceType && <Badge variant="outline" className="text-xs rounded-full">{r.resourceType}</Badge>}
                    {r.featured && <Badge className="text-xs rounded-full bg-yellow-100 text-yellow-800">Featured</Badge>}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs"
                    title="Toggle featured"
                    onClick={() => updateMutation.mutate({ id: r.id, featured: !r.featured })}
                  >
                    {r.featured ? <StarOff className="w-3 h-3 text-yellow-500" /> : <Star className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs"
                    title="Upload file"
                    disabled={uploadingId === r.id}
                    onClick={() => { fileRef.current?.setAttribute("data-id", String(r.id)); fileRef.current?.click(); }}
                  >
                    <Upload className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-xs text-red-500" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: r.id }); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {resources.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No resources yet.</p>}
      </div>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const id = parseInt(fileRef.current?.getAttribute("data-id") || "0");
          if (file && id) handleFileUpload(id, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="rounded-3xl border-0 shadow-lg max-w-sm w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Admin Access</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Sign in with your admin account to access the CMS panel.
            </p>
            <a href={getLoginUrl("/admin")}>
              <Button className="w-full rounded-full font-semibold">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="rounded-3xl border-0 shadow-lg max-w-sm w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm">
              You don't have admin privileges. Contact the site owner to request access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">Admin CMS Panel</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Manage all content for Deeds By Kids</p>
          </div>
        </div>

        <Tabs defaultValue="members">
          <TabsList className="rounded-full mb-4 sm:mb-6 flex-wrap h-auto gap-1 p-1 w-full justify-start sm:justify-start">
            <TabsTrigger value="members" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Users className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Members</span>
              <span className="sm:hidden">M</span>
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Handshake className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Collaborations</span>
              <span className="sm:hidden">C</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Calendar className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Events</span>
              <span className="sm:hidden">E</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <BookOpen className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Resources</span>
              <span className="sm:hidden">R</span>
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Mail className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Email Members</span>
              <span className="sm:hidden">E</span>
            </TabsTrigger>
            <TabsTrigger value="memberEvents" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Calendar className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Member Events</span>
              <span className="sm:hidden">ME</span>
            </TabsTrigger>
            <TabsTrigger value="memberAccounts" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
              <Lock className="w-3 h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Member Accounts</span>
              <span className="sm:hidden">MA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MembersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborations">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Collaboration Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CollaborationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Events Management</CardTitle>
              </CardHeader>
              <CardContent>
                <EventsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Resources Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ResourcesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <AdminEmailExport />
          </TabsContent>

          <TabsContent value="memberEvents">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Member Events Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminEventManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memberAccounts">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Member Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminMemberAccountManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
