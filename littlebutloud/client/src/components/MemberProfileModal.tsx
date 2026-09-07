import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, ExternalLink, X, Calendar, Clock, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Member {
  id: number;
  name: string;
  initiativeName?: string | null;
  location?: string | null;
  country?: string | null;
  issueAreas?: string | null;
  memberType?: string | null;
  description?: string | null;
  website?: string | null;
  social?: string | null;
  coverImageUrl?: string | null;
}

interface MemberProfileModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberProfileModal({ member, isOpen, onClose }: MemberProfileModalProps) {
  if (!member) return null;

  const issueAreas = member.issueAreas ? JSON.parse(member.issueAreas) : [];
  
  const parseSocialMedia = () => {
    try {
      return member.social ? JSON.parse(member.social) : [];
    } catch (e) {
      return [];
    }
  };

  const socials = parseSocialMedia();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Cover Image - Full Width */}
        {member.coverImageUrl && (
          <div className="mb-6 -mx-6 -mt-6 bg-gradient-to-br from-primary/20 to-pink-50 h-40 flex items-center justify-center rounded-t-2xl overflow-hidden">
            <img
              src={member.coverImageUrl}
              alt={member.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error(`[ProfileModal] Failed to load cover image: ${member.coverImageUrl}`);
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log(`[ProfileModal] Successfully loaded cover image`);
              }}
            />
          </div>
        )}

        {/* Profile Content */}
        <div className="space-y-5">
          {/* Name & Initiative */}
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold mb-1">{member.name}</h2>
            {member.initiativeName && (
              <p className="text-sm text-muted-foreground font-semibold mb-3">{member.initiativeName}</p>
            )}
          </div>

          {/* Issue Areas */}
          {issueAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {issueAreas.map((area: string) => (
                <Badge
                  key={area}
                  className="rounded-full text-xs"
                  style={{ background: "var(--brand-purple)", color: "white" }}
                >
                  {area}
                </Badge>
              ))}
            </div>
          )}

          {/* Location & Country */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            {member.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {member.location}
              </div>
            )}
            {member.country && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {member.country}
              </div>
            )}
          </div>

          {/* Member Type */}
          {member.memberType && (
            <div className="text-center">
              <Badge variant="outline" className="rounded-full text-xs">
                {member.memberType}
              </Badge>
            </div>
          )}

          {/* Full Story / Description */}
          {member.description && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{member.description}</p>
            </div>
          )}

          {/* Website Link */}
          {member.website && (
            <div className="flex justify-center">
              <a
                href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-semibold"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            </div>
          )}

          {/* Social Media Links */}
          {socials.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground text-center">Connect on Social Media</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {socials.map((social: any, idx: number) => {
                  if (!social.platform || !social.handle) return null;
                  const platformLower = social.platform.toLowerCase();
                  let url = social.handle;
                  
                  if (!url.startsWith("http")) {
                    if (platformLower === "instagram") url = `https://instagram.com/${url.replace("@", "")}`;
                    else if (platformLower === "twitter") url = `https://twitter.com/${url.replace("@", "")}`;
                    else if (platformLower === "facebook") url = `https://facebook.com/${url}`;
                    else if (platformLower === "linkedin") url = `https://linkedin.com/in/${url}`;
                    else url = `https://${url}`;
                  }
                  
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {social.platform}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member Events Carousel */}
          <MemberEventsCarousel memberId={member.id} />

          {/* Close Button */}
          <Button onClick={onClose} variant="outline" className="w-full rounded-full mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Events Carousel ───────────────────────────────────────────────────
function MemberEventsCarousel({ memberId }: { memberId: number }) {
  const { data: events = [], isLoading } = trpc.memberEvents.getByMemberId.useQuery({ memberId });
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return <div className="text-center py-4 text-sm text-muted-foreground">Loading events...</div>;
  }

  if (!events || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-lg font-bold mb-4">Events by this Member</h3>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground line-clamp-2">{currentEvent.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{currentEvent.details}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground/70">
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                <span>{currentEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                <span>{new Date(currentEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                <span>{currentEvent.startTime} - {currentEvent.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Users className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                <span>Volunteers: {currentEvent.volunteerLimit}</span>
              </div>
            </div>

            {/* Carousel Navigation */}
            {events.length > 1 && (
              <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1))}
                  className="flex-1"
                >
                  ← Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} / {events.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1))}
                  className="flex-1"
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
