import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Handshake, MapPin, Calendar, ArrowRight, CheckCircle, Users, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDateRange } from "@/lib/dateDisplay";
import { toast } from "sonner";
import { useState } from "react";
import React from "react";
import MemberEventSignupForm from "@/components/MemberEventSignupForm";

const postCollabSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  nature: z.string().min(1, "Nature of collaboration is required"),
  skillsNeeded: z.string().min(1, "Skills needed is required"),
  location: z.string().min(1, "Location is required"),
  contactEmail: z.string().email("Valid email required"),
});

type PostCollabData = z.infer<typeof postCollabSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// ─── Member Events Section ────────────────────────────────────────────────────
function MemberEventsSection({ onSelectEvent }: { onSelectEvent: (eventId: any) => void }) {
  const { data: allMemberEvents = [], isLoading } = trpc.memberEvents.getAll.useQuery();

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  if (!allMemberEvents || allMemberEvents.length === 0) {
    return (
      <Card className="p-6 text-center border-0 shadow-sm rounded-2xl bg-white">
        <p className="text-muted-foreground">No member-created events available at this time.</p>
      </Card>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {allMemberEvents.map((event: any) => (
        <motion.div key={event.id} variants={itemVariants}>
          <Card className="h-full card-lift rounded-2xl border-0 shadow-sm overflow-hidden bg-white">
            <div className="h-1" style={{ background: "var(--brand-teal)" }} />
            <CardContent className="p-5 sm:p-6 md:p-7">
              <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2">{event.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.details}</p>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                  <span>Organized by: {event.memberName}</span>
                </div>
              </div>

              <Button
                onClick={() => onSelectEvent(event.id)}
                className="w-full"
                style={{ background: "var(--brand-teal)" }}
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Collaborate() {
  const [submitted, setSubmitted] = useState(false);
  const [showEventSignup, setShowEventSignup] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { data: collaborations = [], isLoading } = trpc.collaborations.list.useQuery();
  const postMutation = trpc.collaborations.post.useMutation();

  const postForm = useForm<PostCollabData>({ resolver: zodResolver(postCollabSchema) });

  const onPostSubmit = async (data: PostCollabData) => {
    try {
      await postMutation.mutateAsync({
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        nature: data.nature,
        skillsNeeded: data.skillsNeeded,
        location: data.location,
        contactEmail: data.contactEmail,
      });
      setSubmitted(true);
      postForm.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error("Failed to post collaboration");
    }
  };

  const approvedCollaborations = collaborations.filter((c: any) => c.status === "approved");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-hero py-12 sm:py-16 md:py-20 px-4 sm:px-0">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Collaborate with the Network
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover collaboration opportunities and connect with like-minded organizations and individuals
          </motion.p>
        </div>
      </div>

      <div className="container py-16 sm:py-20 md:py-24 space-y-20 sm:space-y-24 md:space-y-32">
        {/* Collaborations List */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--brand-purple)" }}>
              <Handshake className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Collaboration Opportunities</h2>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            </div>
          ) : approvedCollaborations.length === 0 ? (
            <Card className="p-8 text-center border-0 shadow-sm rounded-2xl bg-white">
              <p className="text-muted-foreground">No collaboration opportunities available yet.</p>
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {approvedCollaborations.map((collab: any) => {
                const dateRange = formatDateRange(collab.startDate, collab.endDate);
                return (
                  <motion.div key={collab.id} variants={itemVariants}>
                    <Card className="h-full card-lift rounded-2xl border-0 shadow-sm overflow-hidden bg-white">
                      <div className="h-1" style={{ background: "var(--brand-orange)" }} />
                      <CardContent className="p-5 sm:p-6 md:p-7">
                        <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2">{collab.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{collab.description}</p>

                        <div className="space-y-3 mb-5">
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                            <span>{dateRange}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-teal)" }} />
                            <span>{collab.location}</span>
                          </div>
                          {collab.nature && (
                            <div className="text-sm">
                              <span className="font-semibold text-foreground">Nature: </span>
                              <span className="text-foreground/70">{collab.nature}</span>
                            </div>
                          )}
                          {collab.skillsNeeded && (
                            <div className="text-sm">
                              <span className="font-semibold text-foreground">Skills needed: </span>
                              <span className="text-foreground/70">{collab.skillsNeeded}</span>
                            </div>
                          )}
                        </div>

                        <a
                          href={`mailto:${collab.contactEmail}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                          Contact <ArrowRight className="w-3 h-3" />
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Network Member Events Section */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--brand-teal)" }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Network Member Initiated Events</h2>
          </motion.div>

          <MemberEventsSection onSelectEvent={(eventId) => {
            setSelectedEventId(eventId);
            setShowEventSignup(true);
          }} />
        </motion.div>

        {/* Event Signup Modal */}
        {showEventSignup && selectedEventId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 rounded-2xl">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-xl">
              <MemberEventSignupForm
                eventId={selectedEventId}
                eventName=""
                onSuccess={() => setShowEventSignup(false)}
                onCancel={() => setShowEventSignup(false)}
              />
            </div>
          </div>
        )}

        {/* Post Collaboration */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--brand-purple)" }}>
              <Handshake className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Post a Collaboration</h2>
          </motion.div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card className="p-6 border-0 shadow-sm bg-green-50 border-l-4" style={{ borderLeftColor: "var(--brand-green)" }}>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">Thank you for posting!</h3>
                    <p className="text-green-800 text-sm">Your collaboration request has been received and is pending admin review. Network members interested in your opportunity will contact you shortly at <strong>{postForm.getValues("contactEmail")}</strong>.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 sm:p-8 md:p-10 border-0 shadow-sm rounded-2xl bg-white">
              <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Collaboration Title</label>
                  <Input
                    {...postForm.register("title")}
                    placeholder="e.g., Community Clean-up Drive"
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Description</label>
                  <Textarea
                    {...postForm.register("description")}
                    placeholder="Describe your collaboration opportunity in detail..."
                    rows={4}
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Start Date</label>
                    <Input
                      type="date"
                      {...postForm.register("startDate")}
                      className="rounded-lg border-border"
                    />
                    {postForm.formState.errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">End Date</label>
                    <Input
                      type="date"
                      {...postForm.register("endDate")}
                      className="rounded-lg border-border"
                    />
                    {postForm.formState.errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Nature of Collaboration</label>
                  <Input
                    {...postForm.register("nature")}
                    placeholder="e.g., Community Service, Research, Mentorship"
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.nature && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.nature.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Skills Needed</label>
                  <Input
                    {...postForm.register("skillsNeeded")}
                    placeholder="e.g., Event Planning, Marketing, Design"
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.skillsNeeded && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.skillsNeeded.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Location</label>
                  <Input
                    {...postForm.register("location")}
                    placeholder="Singapore"
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.location && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">Contact Email</label>
                  <Input
                    type="email"
                    {...postForm.register("contactEmail")}
                    placeholder="your@email.com"
                    className="rounded-lg border-border"
                  />
                  {postForm.formState.errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{postForm.formState.errors.contactEmail.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={postMutation.isPending}
                  className="w-full rounded-lg font-semibold py-3 sm:py-4"
                >
                  {postMutation.isPending ? "Posting..." : "Post Collaboration"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
