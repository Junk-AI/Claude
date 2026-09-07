import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, MapPin, Users, Plus, Eye, LogOut, User } from "lucide-react";
import MembersPortalLogin from "./MembersPortalLogin";
import MemberProfile from "./MemberProfile";
import { useMemberAuth } from "@/contexts/MemberAuthContext";

// ─── Event Creation Schema ────────────────────────────────────────────────────
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  venue: z.string().min(1, "Venue is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  date: z.string().min(1, "Date is required"),
  contactPerson: z.string().min(1, "Contact person (email or phone) is required"),
  details: z.string().min(10, "Event details must be at least 10 characters"),
  volunteerLimit: z.coerce.number().int().positive("Volunteer limit must be positive"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface MemberSession {
  memberId: number;
  username: string;
  memberName: string;
  email: string;
}

interface MembersPortalProps {
  session?: MemberSession;
  onLogout?: () => void;
}

export default function MembersPortal({ session, onLogout }: MembersPortalProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"create" | "track" | "settings">("create");
  const [settingsTab, setSettingsTab] = useState<"profile" | "password">("profile");
  const [showEventForm, setShowEventForm] = useState(false);
  const { isMemberLoggedIn, memberId, memberUsername, logout: logoutMember } = useMemberAuth();

  const handleLogout = () => {
    logoutMember();
  };

  // Show login page if not logged in
  if (!isMemberLoggedIn || !memberId) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-md mx-auto pt-12 sm:pt-20">
          <MembersPortalLogin onLoginSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Members Portal</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Welcome, {memberUsername || "Member"}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 rounded-full whitespace-nowrap">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            onClick={() => setActiveTab("create")}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create Event
          </Button>
          <Button
            variant={activeTab === "track" ? "default" : "outline"}
            onClick={() => setActiveTab("track")}
            className="flex items-center gap-2"
          >
            <Eye size={18} />
            Track Events
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-2"
          >
            <User size={18} />
            Edit Profile
          </Button>
        </div>

        {/* Create Event Tab */}
        {activeTab === "create" && memberId && <CreateEventTab memberId={memberId} />}

        {/* Track Events Tab */}
        {activeTab === "track" && memberId && <TrackEventsTab memberId={memberId} />}

        {/* Settings Tab with sub-tabs */}
        {activeTab === "settings" && memberId && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setSettingsTab("profile")}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  settingsTab === "profile"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Profile
              </button>
              <button
                onClick={() => setSettingsTab("password")}
                className={`px-4 py-2 font-semibold text-sm transition-colors ${
                  settingsTab === "password"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Change Password
              </button>
            </div>
            {settingsTab === "profile" && <MemberProfile />}
            {settingsTab === "password" && (
              <div className="max-w-2xl">
                <MemberProfile showPasswordOnly={true} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Event Tab ─────────────────────────────────────────────────────────
function CreateEventTab({ memberId }: { memberId: number }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(eventSchema),
  });

  const createEventMutation = trpc.memberEvents.create.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully!");
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const onSubmit = (data: EventFormData) => {
    const [year, month, day] = data.date.split("-");
    const eventDate = new Date(`${year}-${month}-${day}`);

    createEventMutation.mutate({
      memberId,
      name: data.name,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      date: eventDate,
      contactPerson: data.contactPerson,
      details: data.details,
      volunteerLimit: data.volunteerLimit,
    });
  };

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-xl sm:text-2xl">Create Volunteering Opportunity</CardTitle>
        <CardDescription className="text-sm sm:text-base">Fill in the details to create a new event</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit((data: any) => onSubmit(data as EventFormData))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="e.g., Community Cleanup Drive"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-red-600">{String(errors.name?.message)}</p>}
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin size={16} />
                Venue
              </Label>
              <Input
                id="venue"
                placeholder="e.g., Central Park, Singapore"
                {...register("venue")}
              />
              {errors.venue && <p className="text-sm text-red-600">{String(errors.venue?.message)}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar size={16} />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && <p className="text-sm text-red-600">{String(errors.date?.message)}</p>}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock size={16} />
                Start Time
              </Label>
              <select
                id="startTime"
                {...register("startTime")}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select start time</option>
                {Array.from({ length: 24 }, (_, h) =>
                  Array.from({ length: 4 }, (_, m) => {
                    const hour = String(h).padStart(2, "0");
                    const minute = String(m * 15).padStart(2, "0");
                    return `${hour}:${minute}`;
                  })
                ).flat().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.startTime && <p className="text-sm text-red-600">{String(errors.startTime?.message)}</p>}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock size={16} />
                End Time
              </Label>
              <select
                id="endTime"
                {...register("endTime")}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select end time</option>
                {Array.from({ length: 24 }, (_, h) =>
                  Array.from({ length: 4 }, (_, m) => {
                    const hour = String(h).padStart(2, "0");
                    const minute = String(m * 15).padStart(2, "0");
                    return `${hour}:${minute}`;
                  })
                ).flat().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.endTime && <p className="text-sm text-red-600">{String(errors.endTime?.message)}</p>}
            </div>

            {/* Volunteer Limit */}
            <div className="space-y-2">
              <Label htmlFor="volunteerLimit" className="flex items-center gap-2">
                <Users size={16} />
                Volunteer Limit
              </Label>
              <Input
                id="volunteerLimit"
                type="number"
                placeholder="50"
                {...register("volunteerLimit")}
              />
              {errors.volunteerLimit && <p className="text-sm text-red-600">{String(errors.volunteerLimit?.message)}</p>}
            </div>

            {/* Contact Person - Email or Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact (Email or Phone)</Label>
              <Input
                id="contactPerson"
                placeholder="e.g., john@example.com or +65 9123 4567"
                {...register("contactPerson")}
              />
              {errors.contactPerson && <p className="text-sm text-red-600">{String(errors.contactPerson?.message)}</p>}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Event Details</Label>
            <Textarea
              id="details"
              placeholder="Describe your event, what volunteers will do, what to bring, etc."
              rows={5}
              {...register("details")}
            />
            {errors.details && <p className="text-sm text-red-600">{String(errors.details?.message)}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createEventMutation.isPending}
            className="w-full"
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Track Events Tab ─────────────────────────────────────────────────────────
function TrackEventsTab({ memberId }: { memberId: number }) {
  const { data: events, isLoading } = trpc.memberEvents.getByMemberId.useQuery({ memberId });
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (!events || events.length === 0) {
    return (
      <Card className="rounded-2xl border-0 shadow-sm bg-white">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No events created yet. Create your first event to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventSignupCard
          key={event.id}
          event={event}
          memberId={memberId}
          isSelected={selectedEventId === event.id}
          onSelect={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
        />
      ))}
    </div>
  );
}

// ─── Event Signup Card ────────────────────────────────────────────────────────
function EventSignupCard({
  event,
  memberId,
  isSelected,
  onSelect,
}: {
  event: any;
  memberId: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: signups, isLoading } = trpc.memberEvents.getSignups.useQuery(
    { eventId: event.id, memberId },
    { enabled: isSelected }
  );

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white card-lift">
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onSelect}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg sm:text-xl truncate">{event.name}</CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1 truncate">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="truncate">{event.venue}</span>
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock size={14} />
                {event.startTime} - {event.endTime}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              {isSelected ? "Hide" : "Show"} Signups
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-xs"
            >
              Edit Event
            </Button>
          </div>
        </div>
      </CardHeader>

      {isSelected && (
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{signups?.length || 0}</span> / {event.volunteerLimit} volunteers signed up
              </p>
            </div>

            {isLoading ? (
              <p className="text-center text-gray-600">Loading signups...</p>
            ) : !signups || signups.length === 0 ? (
              <p className="text-center text-gray-600">No signups yet</p>
            ) : (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Signups:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {signups.map((signup: any) => (
                    <div key={signup.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="font-medium">{signup.name}</p>
                      <p className="text-gray-600">{signup.email}</p>
                      <p className="text-gray-600">{signup.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
                </CardContent>
      )}

      {/* Edit Event Modal */}
      {isEditOpen && (
        <EventEditModal
          event={event}
          memberId={memberId}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </Card>
  );
}

// ─── Event Edit Modal ─────────────────────────────────────────────────────
function EventEditModal({
  event,
  memberId,
  isOpen,
  onClose,
}: {
  event: any;
  memberId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      venue: event.venue,
      startTime: event.startTime,
      endTime: event.endTime,
      date: new Date(event.date).toISOString().split('T')[0],
      contactPerson: event.contactPerson,
      details: event.details,
      volunteerLimit: event.volunteerLimit,
    },
  });

  const updateEventMutation = trpc.memberEvents.update.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully!");
      onClose();
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  const onSubmit = (data: any) => {
    const [year, month, day] = data.date.split("-");
    const eventDate = new Date(`${year}-${month}-${day}`);

    updateEventMutation.mutate({
      eventId: event.id,
      memberId,
      name: data.name,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      date: eventDate,
      contactPerson: data.contactPerson,
      details: data.details,
      volunteerLimit: data.volunteerLimit,
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{String(errors.name?.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input {...register("venue")} />
              {errors.venue && <p className="text-sm text-red-600">{String(errors.venue?.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-red-600">{String(errors.date?.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <select {...register("startTime")} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <option value="">Select start time</option>
                {Array.from({ length: 24 }, (_, h) =>
                  Array.from({ length: 4 }, (_, m) => {
                    const hour = String(h).padStart(2, "0");
                    const minute = String(m * 15).padStart(2, "0");
                    return `${hour}:${minute}`;
                  })
                ).flat().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <select {...register("endTime")} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <option value="">Select end time</option>
                {Array.from({ length: 24 }, (_, h) =>
                  Array.from({ length: 4 }, (_, m) => {
                    const hour = String(h).padStart(2, "0");
                    const minute = String(m * 15).padStart(2, "0");
                    return `${hour}:${minute}`;
                  })
                ).flat().map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Volunteer Limit</Label>
              <Input type="number" {...register("volunteerLimit")} />
            </div>
            <div className="space-y-2">
              <Label>Contact (Email or Phone)</Label>
              <Input {...register("contactPerson")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Event Details</Label>
            <Textarea rows={4} {...register("details")} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
