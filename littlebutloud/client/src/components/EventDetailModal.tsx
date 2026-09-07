import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail, Users, Download, Clock } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description?: string | null;
  eventDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  capacityLimit?: number | null;
  location?: string | null;
  organiser?: string | null;
  contactEmail?: string | null;
  adminNotes?: string | null;
  coverImageUrl?: string | null;
  eventRegistrations?: Array<{ id: number; name: string; email: string; createdAt: Date }> | null;
}

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

function generateCalendarFile(event: Event) {
  const eventDate = new Date(event.eventDate);
  const dateStr = eventDate.toISOString().split("T")[0].replace(/-/g, "");
  
  // Parse start and end times
  let startDateTime = eventDate.toISOString();
  let endDateTime = eventDate.toISOString();
  
  if (event.startTime) {
    const [hours, minutes] = event.startTime.split(":").map(Number);
    const start = new Date(eventDate);
    start.setHours(hours, minutes, 0);
    startDateTime = start.toISOString();
  }
  
  if (event.endTime) {
    const [hours, minutes] = event.endTime.split(":").map(Number);
    const end = new Date(eventDate);
    end.setHours(hours, minutes, 0);
    endDateTime = end.toISOString();
  }
  
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Network of Deeds by Kids//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:event-${event.id}@littlebutloud.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDateTime.replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${endDateTime.replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
ORGANIZER:CN=${event.organiser || ""}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onRegisterClick,
}: EventDetailModalProps) {
  if (!event) return null;

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{event.title}</DialogTitle>
        </DialogHeader>

        {/* Cover Image */}
        {event.coverImageUrl && (
          <div className="mb-4 -mx-6 -mt-6">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-64 object-cover rounded-t-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Event Content */}
        <div className="space-y-5">
          {/* Organizer */}
          {event.organiser && (
            <p className="text-sm text-muted-foreground font-semibold">
              Organized by {event.organiser}
            </p>
          )}

          {/* Date & Time */}
          <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">{formattedDate}</p>
              <p className="text-sm text-muted-foreground">{formattedTime}</p>
              {event.startTime && event.endTime && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.startTime} - {event.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          )}

          {/* Contact Email */}
          {event.contactEmail && (
            <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Contact</p>
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {event.contactEmail}
                </a>
              </div>
            </div>
          )}

          {/* Capacity Info */}
          {event.capacityLimit && (
            <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Capacity</p>
                <p className="text-sm text-muted-foreground">{event.capacityLimit} spots available</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Admin Notes (if present) */}
          {event.adminNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-900 mb-1">Admin Notes</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                {event.adminNotes}
              </p>
            </div>
          )}

          {/* Event Signups */}
          {event.eventRegistrations && event.eventRegistrations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-900 mb-3">Signups ({event.eventRegistrations.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {event.eventRegistrations.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between text-sm bg-white rounded-lg p-2 border border-blue-100">
                    <div>
                      <p className="font-medium text-blue-900">{signup.name}</p>
                      <p className="text-xs text-blue-700">{signup.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {onRegisterClick && (
              <Button
                onClick={onRegisterClick}
                className="flex-1 rounded-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Register for Event
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => generateCalendarFile(event)}
              className="rounded-full"
              title="Save to Calendar"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
