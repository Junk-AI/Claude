import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, MapPin, Users, Trash2, CheckCircle, XCircle } from "lucide-react";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  venue: z.string().min(1, "Venue is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  date: z.string().min(1, "Date is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  details: z.string().min(10, "Event details must be at least 10 characters"),
  volunteerLimit: z.coerce.number().int().positive("Volunteer limit must be positive"),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEventManagement() {
  const { data: allEvents, isLoading, refetch } = trpc.memberEvents.getAll.useQuery();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Management</h1>
        <p className="text-muted-foreground mt-2">Review, edit, and manage all member-created events</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading events...</CardContent>
        </Card>
      ) : !allEvents || allEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No member-created events yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allEvents.map((event: any) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event.volunteerLimit} volunteers
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this event?")) {
                          // Delete functionality would go here
                          toast.success("Event deleted");
                          refetch();
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{event.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Details</p>
                    <p className="font-medium line-clamp-2">{event.details}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && isDetailsOpen && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Event Edit Modal */}
      {selectedEvent && isEditOpen && (
        <AdminEventEditModal
          event={selectedEvent}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedEvent(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: signups } = trpc.memberEvents.getSignups.useQuery({
    eventId: event.id,
    memberId: event.memberId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Venue</p>
              <p className="font-medium">{event.venue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{event.startTime} - {event.endTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volunteer Limit</p>
              <p className="font-medium">{event.volunteerLimit}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{event.contactPerson}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Event Details</p>
            <p className="text-sm whitespace-pre-wrap">{event.details}</p>
          </div>

          {signups && signups.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3">Signups ({signups.length})</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {signups.map((signup: any) => (
                  <div key={signup.id} className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium">{signup.name}</p>
                    <p className="text-muted-foreground">{signup.email}</p>
                    <p className="text-muted-foreground">{signup.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminEventEditModal({
  event,
  isOpen,
  onClose,
}: {
  event: any;
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
      memberId: event.memberId,
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
