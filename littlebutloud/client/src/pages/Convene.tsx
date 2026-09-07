import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSharedEventId } from "@/lib/eventLinks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import EventDetailModal from "@/components/EventDetailModal";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Plus,
  CheckCircle,
  Image as ImageIcon,
  Users,
  Ticket,
} from "lucide-react";

// ─── Register Interest Form ───────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
});

function RegisterInterestForm({ eventId, eventTitle, onSuccess }: { eventId?: number; eventTitle?: string; onSuccess?: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = trpc.events.registerInterest.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      reset();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to register. Please try again.");
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: any) => {
    registerMutation.mutate({
      eventId,
      name: data.name,
      email: data.email,
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-semibold">Registered!</p>
        <p className="text-sm text-muted-foreground mt-1">We'll keep you updated about this event.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {eventTitle && (
        <p className="text-sm text-muted-foreground">Registering interest for: <span className="font-semibold text-foreground">{eventTitle}</span></p>
      )}
      <div>
        <Label htmlFor="reg-name" className="font-semibold">Your Name *</Label>
        <Input id="reg-name" placeholder="Full name" className="mt-1 rounded-xl" {...register("name")} />
        {errors.name && <p className="text-destructive text-xs mt-1">{String(errors.name.message)}</p>}
      </div>
      <div>
        <Label htmlFor="reg-email" className="font-semibold">Email Address *</Label>
        <Input id="reg-email" type="email" placeholder="your@email.com" className="mt-1 rounded-xl" {...register("email")} />
        {errors.email && <p className="text-destructive text-xs mt-1">{String(errors.email.message)}</p>}
      </div>
      <Button type="submit" className="w-full rounded-full font-semibold" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Registering..." : "Register Interest"}
      </Button>
    </form>
  );
}

// ─── Add Event Form (Admin) ───────────────────────────────────────────────────
const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  organiser: z.string().optional(),
  status: z.enum(["upcoming", "past", "cancelled"]).default("upcoming"),
});

function AddEventForm({ onSuccess }: { onSuccess?: () => void }) {
  const utils = trpc.useUtils();
  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully!");
      reset();
      utils.events.upcoming.invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create event.");
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: "upcoming" as const },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      eventDate: new Date(data.eventDate),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location || undefined,
      organiser: data.organiser || undefined,
      status: data.status,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="ev-title" className="font-semibold">Event Title *</Label>
        <Input id="ev-title" placeholder="Event name" className="mt-1 rounded-xl" {...register("title")} />
        {errors.title && <p className="text-destructive text-xs mt-1">{String(errors.title.message)}</p>}
      </div>
      <div>
        <Label htmlFor="ev-date" className="font-semibold">Event Date *</Label>
        <Input id="ev-date" type="date" className="mt-1 rounded-xl" {...register("eventDate")} />
        {errors.eventDate && <p className="text-destructive text-xs mt-1">{String(errors.eventDate.message)}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ev-start-time" className="font-semibold">Start Time *</Label>
          <Input id="ev-start-time" type="time" className="mt-1 rounded-xl" {...register("startTime")} />
          {errors.startTime && <p className="text-destructive text-xs mt-1">{String(errors.startTime.message)}</p>}
        </div>
        <div>
          <Label htmlFor="ev-end-time" className="font-semibold">End Time *</Label>
          <Input id="ev-end-time" type="time" className="mt-1 rounded-xl" {...register("endTime")} />
          {errors.endTime && <p className="text-destructive text-xs mt-1">{String(errors.endTime.message)}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ev-location" className="font-semibold">Location</Label>
          <Input id="ev-location" placeholder="City or Online" className="mt-1 rounded-xl" {...register("location")} />
        </div>
        <div>
          <Label htmlFor="ev-organiser" className="font-semibold">Organiser</Label>
          <Input id="ev-organiser" placeholder="Organiser name" className="mt-1 rounded-xl" {...register("organiser")} />
        </div>
      </div>
      <div>
        <Label htmlFor="ev-desc" className="font-semibold">Description</Label>
        <Textarea id="ev-desc" placeholder="Event details..." className="mt-1 rounded-xl" {...register("description")} />
      </div>
      <Button type="submit" className="w-full rounded-full font-semibold" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create Event"}
        <Plus className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, openFromLink = false, onLinkedEventClose }: { event: any; openFromLink?: boolean; onLinkedEventClose?: () => void }) {
  const [, setLocation] = useLocation();
  const [detailOpen, setDetailOpen] = useState(false);
  const date = new Date(event.eventDate);

  useEffect(() => {
    if (openFromLink) setDetailOpen(true);
  }, [openFromLink]);

  return (
    <>
    <Card className="card-lift rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
      {event.coverImageUrl && (
        <button
          type="button"
          className="block w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={() => setDetailOpen(true)}
          aria-label={`View details for ${event.title}`}
        >
          <img
            src={event.coverImageUrl}
            alt={`Cover image for ${event.title}`}
            loading="lazy"
            decoding="async"
            className="h-44 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            onError={(e) => { (e.currentTarget.parentElement as HTMLButtonElement).style.display = "none"; }}
          />
        </button>
      )}
      <CardContent className="p-5 sm:p-6 md:p-7">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-bold" style={{ background: "var(--brand-teal)" }}>
            <span className="text-xs uppercase leading-none">{date.toLocaleString("default", { month: "short" })}</span>
            <span className="text-lg sm:text-xl md:text-2xl leading-none">{date.getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <button
              type="button"
              className="mb-1 block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              onClick={() => setDetailOpen(true)}
              aria-label={`View details for ${event.title}`}
            >
              <h3 className="font-display font-bold text-lg leading-snug hover:text-primary transition-colors">{event.title}</h3>
            </button>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
              )}
              {event.organiser && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event.organiser}
                </span>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{event.description}</p>
            )}
            <Button size="sm" className="rounded-full text-xs font-semibold" style={{ background: "var(--brand-teal)" }} onClick={() => setLocation(`/convene/register/${event.id}`)}>
              <Ticket className="mr-2 h-4 w-4" aria-hidden="true" /> Sign up for event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    <EventDetailModal
      event={event}
      isOpen={detailOpen}
      onClose={() => {
        setDetailOpen(false);
        if (openFromLink) onLinkedEventClose?.();
      }}
      onRegisterClick={() => {
        setDetailOpen(false);
        setLocation(`/convene/register/${event.id}`);
      }}
    />
    </>
  );
}

// ─── Past Event Gallery ───────────────────────────────────────────────────────
function PastEventCard({ event }: { event: any }) {
  const [expanded, setExpanded] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [photosPassword, setPhotosPassword] = useState("");
  const [photosError, setPhotosError] = useState("");
  const unlockPhotosMutation = trpc.pastEvents.unlockPhotos.useMutation({
    onSuccess: ({ photosUrl }) => {
      setPhotosOpen(false);
      setPhotosPassword("");
      setPhotosError("");
      window.location.assign(photosUrl);
    },
    onError: (error) => {
      setPhotosError(error.message === "Wrong password" ? "Wrong password" : "Unable to open event photos. Please try again.");
    },
  });

  const requestPhotos = () => {
    setPhotosError("");
    if (event.photosProtected) {
      setPhotosOpen(true);
      return;
    }
    unlockPhotosMutation.mutate({ id: event.id });
  };

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden card-lift">
      {/* Gallery images */}
      {event.images && event.images.length > 0 && (
        <div className={`grid gap-1 ${event.images.length === 1 ? "grid-cols-1" : event.images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {event.images.slice(0, 3).map((img: any, i: number) => (
            <div key={img.id} className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-pink-50 flex items-center justify-center">
              <img
                src={img.imageUrl}
                alt={img.caption || `Event photo ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {i === 2 && event.images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{event.images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {(!event.images || event.images.length === 0) && (
        <div className="h-32 bg-secondary flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <CardContent className="p-5">
        <h3 className="font-display font-bold text-base mb-1">{event.title}</h3>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
          {event.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(event.eventDate).toLocaleDateString()}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location}
            </span>
          )}
          {event.participants && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.participants}
            </span>
          )}
        </div>
        {event.description && (
          <p className={`text-sm text-foreground/70 ${expanded ? "" : "line-clamp-2"}`}>
            {event.description}
          </p>
        )}
        {event.description && event.description.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline mt-1"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        {event.hasPhotos && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              className="rounded-lg font-medium"
              onClick={requestPhotos}
              disabled={unlockPhotosMutation.isPending}
            >
              <ImageIcon className="w-4 h-4" />
              {unlockPhotosMutation.isPending ? "Opening photos..." : "Event Photos"}
            </Button>
          </div>
        )}
      </CardContent>
      <Dialog open={photosOpen} onOpenChange={(open) => {
        setPhotosOpen(open);
        if (!open) {
          setPhotosPassword("");
          setPhotosError("");
        }
      }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Event Photos</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setPhotosError("");
              unlockPhotosMutation.mutate({ id: event.id, password: photosPassword });
            }}
          >
            <p className="text-sm text-muted-foreground">Enter the password provided by the event organiser to view the photo collection.</p>
            <div>
              <Label htmlFor={`event-photos-password-${event.id}`} className="font-semibold">Photos password</Label>
              <Input
                id={`event-photos-password-${event.id}`}
                type="password"
                autoComplete="current-password"
                value={photosPassword}
                onChange={(e) => setPhotosPassword(e.target.value)}
                className="mt-1 rounded-xl"
                aria-describedby={photosError ? `event-photos-error-${event.id}` : undefined}
              />
              {photosError && <p id={`event-photos-error-${event.id}`} role="alert" className="mt-2 text-sm font-medium text-destructive">{photosError}</p>}
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={unlockPhotosMutation.isPending || !photosPassword}>
              {unlockPhotosMutation.isPending ? "Checking password..." : "View Event Photos"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ─── Convene Page ─────────────────────────────────────────────────────────────
export default function Convene() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [location] = useLocation();
  const [sharedEventId, setSharedEventId] = useState<number | null>(null);

  const { data: upcomingEvents = [], isLoading: loadingUpcoming } = trpc.events.upcoming.useQuery();
  const { data: pastEventsData = [], isLoading: loadingPast } = trpc.pastEvents.list.useQuery();

  useEffect(() => {
    setSharedEventId(getSharedEventId(window.location.search));
  }, [location]);

  const clearSharedEvent = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("event");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    setSharedEventId(null);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-hero py-14 sm:py-14 md:py-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                <Calendar className="w-4 h-4" />
                Convene
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Events & Gatherings
              </h1>
              <p className="text-foreground/70 text-lg leading-relaxed">
                Join events, workshops, and gatherings organised by and for young changemakers.
              </p>
            </div>
            {isAdmin && (
              <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full font-semibold flex-shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Create New Event</DialogTitle>
                  </DialogHeader>
                  <AddEventForm onSuccess={() => setAddEventOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--brand-teal)" }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground text-sm">{upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""} coming up</p>
            </div>
          </div>

          {loadingUpcoming ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white border-0 shadow-sm">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-semibold">No upcoming events at the moment.</p>
              {isAdmin && (
                <Button variant="link" size="sm" className="mt-2" onClick={() => setAddEventOpen(true)}>
                  Add the first event
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  openFromLink={event.id === sharedEventId}
                  onLinkedEventClose={clearSharedEvent}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Past Events Gallery */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--brand-pink)" }}>
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold">Past Events</h2>
              <p className="text-muted-foreground text-sm">Memories from our gatherings</p>
            </div>
          </div>

          {loadingPast ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : pastEventsData.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white border-0 shadow-sm">
              <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No past events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEventsData.map((event) => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
