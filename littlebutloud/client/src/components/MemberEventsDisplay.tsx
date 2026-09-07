import { useState } from "react";
import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MemberEventSignupForm from "./MemberEventSignupForm";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface MemberEventsDisplayProps {
  limit?: number;
}

export default function MemberEventsDisplay({ limit }: MemberEventsDisplayProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For simplicity, fetch from a dedicated procedure that returns all events
  // This is a placeholder - in production, add a getAllMemberEvents procedure
  React.useEffect(() => {
    // Simulating fetching all events - in production, call a dedicated backend procedure
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  const displayedEvents = limit ? events?.slice(0, limit) : events;

  if (!displayedEvents || displayedEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">No member-created events available at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayedEvents.map((event: any) => (
        <EventCard
          key={event.id}
          event={event}
          onSignup={() => {
            setSelectedEventId(event.id);
            setShowSignupForm(true);
          }}
        />
      ))}

      {/* Signup Modal */}
      {selectedEventId && (
        <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Up for Event</DialogTitle>
            </DialogHeader>
            <MemberEventSignupForm
              eventId={selectedEventId}
              eventName={displayedEvents.find((e: any) => e.id === selectedEventId)?.name || ""}
              onSuccess={() => setShowSignupForm(false)}
              onCancel={() => setShowSignupForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onSignup }: { event: any; onSignup: () => void }) {
  const { data: signupCount } = trpc.memberEvents.getSignups.useQuery({
    eventId: event.id,
    memberId: 0, // Public view - no member ID needed for count
  });

  const isFull = signupCount && signupCount.length >= event.volunteerLimit;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-sm">
                <MapPin size={14} />
                {event.venue}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Clock size={14} />
                {event.startTime} - {event.endTime}
              </span>
            </CardDescription>
          </div>
          {isFull && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Full
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Details */}
        <p className="text-sm text-gray-600">{event.details}</p>

        {/* Volunteer Info */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold">{signupCount?.length || 0}</span> / {event.volunteerLimit} volunteers
          </span>
        </div>

        {/* Contact */}
        <div className="text-sm text-gray-600">
          <p className="font-semibold">Contact: {event.contactPerson}</p>
        </div>

        {/* Sign Up Button */}
        <Button
          onClick={onSignup}
          disabled={isFull}
          className="w-full"
        >
          {isFull ? "Event Full" : "Sign Up"}
        </Button>
      </CardContent>
    </Card>
  );
}
