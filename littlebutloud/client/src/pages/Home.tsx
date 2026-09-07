import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/BrandMark";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Lightbulb,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Handshake,
  Zap,
  Globe,
} from "lucide-react";

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

const slideInVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7 },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 sm:py-28 md:py-36 lg:py-40">
      <img
        src="/manus-storage/festival-of-deeds-hero_65eda112.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 z-10 bg-slate-950/60" aria-hidden="true" />
      <div className="container relative z-20 px-4 sm:px-6">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo */}
          <motion.div
            className="mb-8 h-24 w-24 rounded-xl bg-white/95 p-1.5 shadow-lg sm:mb-10 sm:h-28 sm:w-28"
            variants={itemVariants}
          >
            <BrandMark className="h-full w-full" title="Network of Deeds by Kids logo" />
          </motion.div>

          <motion.h1
            className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-medium mb-4 sm:mb-7 leading-[1.05] tracking-[-0.035em] text-white"
            variants={itemVariants}
          >
            Network of Deeds by Kids
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-xl text-white/90 mb-7 sm:mb-10 leading-relaxed max-w-xl font-normal"
            variants={itemVariants}
          >
            Connecting young change-makers, creating change through collaboration. A platform where youth-led initiatives meet, grow, and inspire the world.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            variants={itemVariants}
          >
            <Button asChild size="lg" className="w-full rounded-full bg-white px-6 py-4 text-sm font-medium text-slate-950 shadow-lg transition-all hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:px-9 sm:py-6 sm:text-base">
              <a href="/connect" aria-label="Join the Network of Deeds by Kids">
                Join Network
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full rounded-full border border-white/70 bg-transparent px-6 py-4 text-sm font-medium text-white hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:px-9 sm:py-6 sm:text-base">
              <a href="/connect" aria-label="Explore youth stories and initiatives">
                Explore Youth Stories
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Member Spotlight ─────────────────────────────────────────────────────────
function MemberSpotlight() {
  const { data: spotlightMembers = [], isLoading } = trpc.members.spotlight.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (spotlightMembers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % spotlightMembers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [spotlightMembers.length]);

  const prev = () => setCurrentIndex((i) => (i - 1 + spotlightMembers.length) % spotlightMembers.length);
  const next = () => setCurrentIndex((i) => (i + 1) % spotlightMembers.length);

  return (
    <section id="spotlight" className="py-12 sm:py-16 md:py-24 px-4 sm:px-0">
      <div className="container">
        <motion.div
          className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-yellow)" }}>
            <Star className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-700" />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Member Spotlight</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Meet our young changemakers</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="h-64 rounded-3xl bg-secondary animate-pulse" />
        ) : spotlightMembers.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-secondary/50">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold">No spotlight members yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              <Link href="/connect" className="text-primary hover:underline">Join the network</Link> to be featured!
            </p>
          </div>
        ) : (
          <div className="relative">
            <motion.div
              className="overflow-hidden rounded-3xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {spotlightMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  className={`transition-all duration-500 ${idx === currentIndex ? "block" : "hidden"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: idx === currentIndex ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/connect?member=${member.id}`}>
                    <motion.div
                      className="bg-primary/5 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 cursor-pointer hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-stretch md:items-start w-full">
                        {/* Cover Image */}
                        <motion.div
                          className="flex-shrink-0 w-full md:w-96"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          {member.coverImageUrl ? (
                            <img
                              src={member.coverImageUrl}
                              alt={member.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full md:w-96 rounded-2xl ring-4 ring-white shadow-xl"
                              style={{ aspectRatio: "3/1", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="w-full md:w-96 rounded-2xl bg-primary/20 flex items-center justify-center ring-4 ring-white shadow-xl" style={{ aspectRatio: "3/1" }}>
                              <span className="font-display text-6xl md:text-8xl font-bold text-primary">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Info */}
                        <motion.div
                          className="flex-1 text-center md:text-left"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {member.memberType && (
                            <div className="flex justify-center md:justify-start mb-3">
                              <Badge className="rounded-full text-xs font-semibold" style={{ background: "var(--brand-purple)", color: "white" }}>
                                {member.memberType}
                              </Badge>
                            </div>
                          )}

                          <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">{member.name}</h3>
                          {member.country && (
                            <p className="text-muted-foreground text-sm flex items-center gap-1 justify-center md:justify-start mb-4">
                              <MapPin className="w-3 h-3" />
                              {member.country}
                            </p>
                          )}
                          {member.description && (
                            <p className="text-foreground/70 leading-relaxed max-w-xl line-clamp-3">{member.description}</p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Navigation */}
            {spotlightMembers.length > 1 && (
              <motion.div
                className="flex items-center justify-center gap-4 mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <button 
                  onClick={prev} 
                  className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label="Previous member"
                  title="Previous member"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-2" role="group" aria-label="Member carousel navigation">
                  {spotlightMembers.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${i === currentIndex ? "w-6 bg-primary" : "bg-border"}`}
                      aria-label={`Go to member ${i + 1}`}
                      aria-current={i === currentIndex ? "true" : "false"}
                    />
                  ))}
                </div>
                <button 
                  onClick={next} 
                  className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label="Next member"
                  title="Next member"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Upcoming Events Calendar Widget ─────────────────────────────────────────
function EventsCalendar() {
  const { data: events = [], isLoading } = trpc.events.upcoming.useQuery();

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-0" style={{ background: "oklch(97% 0.02 240)" }}>
      <div className="container">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-teal)" }}>
              <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Don't miss out on what's happening</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden rounded-full sm:flex">
            <a href="/convene#upcoming">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No upcoming events yet.</p>
            <Button asChild variant="link" size="sm" className="mt-2"><a href="/convene#upcoming">Go to Convene page</a></Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {events.slice(0, 6).map((event) => {
              const date = new Date(event.eventDate);
              return (
                <motion.a key={event.id} href="/convene#upcoming" variants={itemVariants}>
                  <Card className="card-lift cursor-pointer rounded-2xl border-0 shadow-sm hover:shadow-md transition-all bg-white">
                    <CardContent className="p-5">
                      <div className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold" style={{ background: "var(--brand-teal)" }}>
                          <span className="text-xs uppercase leading-none">{date.toLocaleString("default", { month: "short" })}</span>
                          <span className="text-xl leading-none">{date.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 mb-1">{event.title}</h3>
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </p>
                          )}
                          {event.organiser && (
                            <p className="text-xs text-muted-foreground mt-1">by {event.organiser}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.a>
              );
            })}
          </motion.div>
        )}

        <motion.div
          className="text-center mt-6 sm:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Button asChild variant="outline" className="rounded-full">
            <a href="/convene#upcoming">
              View All Events <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Resources ───────────────────────────────────────────────────────
function FeaturedResources() {
  const { data: resources = [], isLoading } = trpc.resources.featured.useQuery();

  const typeColors: Record<string, string> = {
    guide: "var(--brand-blue)",
    toolkit: "var(--brand-green)",
    template: "var(--brand-orange)",
    video: "var(--brand-pink)",
    article: "var(--brand-purple)",
    other: "var(--brand-teal)",
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-0">
      <div className="container">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-blue)" }}>
              <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Featured Resources</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Tools and guides for young changemakers</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden rounded-full sm:flex">
            <a href="/create">
              All Resources <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-secondary/50">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No featured resources yet.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {resources.map((resource) => {
              const color = typeColors[resource.resourceType?.toLowerCase() ?? "other"] ?? "var(--brand-purple)";
              return (
                <motion.div key={resource.id} variants={itemVariants}>
                  <Card className="card-lift rounded-2xl border-0 shadow-sm overflow-hidden">
                    <div className="h-2" style={{ background: color }} />
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
                        <Lightbulb className="w-5 h-5" style={{ color }} />
                      </div>
                      {resource.resourceType && (
                        <Badge variant="outline" className="text-xs rounded-full mb-2 capitalize">
                          {resource.resourceType}
                        </Badge>
                      )}
                      <h3 className="font-display font-semibold text-base leading-snug mb-2 line-clamp-2">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{resource.description}</p>
                      )}
                      {(resource.link || resource.fileUrl) && (
                        <a
                          href={resource.link || resource.fileUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          Access Resource <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Latest Updates ───────────────────────────────────────────────────────────
function LatestUpdates() {
  const { data: updates = [], isLoading } = trpc.home.latestUpdates.useQuery({ limit: 6 });

  const typeConfig = {
    event: { label: "Event", color: "var(--brand-teal)", icon: Calendar, href: "/convene" },
    collaboration: { label: "Collaboration", color: "var(--brand-orange)", icon: Handshake, href: "/collaborate" },
    member: { label: "New Member", color: "var(--brand-purple)", icon: Users, href: "/connect" },
  };

  return (
    <section className="py-16 md:py-24" style={{ background: "oklch(97% 0.02 240)" }}>
      <div className="container">
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--brand-orange)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Latest Updates</h2>
            <p className="text-muted-foreground text-sm">What's happening in the network</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white">
            <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No updates yet. Be the first to join!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {updates.map((update, idx) => {
              const config = typeConfig[update.type];
              const Icon = config.icon;
              return (
                <motion.a key={idx} href={config.href} variants={itemVariants}>
                  <Card className="card-lift cursor-pointer rounded-2xl border-0 shadow-sm bg-white h-full">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${config.color}20` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: config.color }}>
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-sm leading-snug line-clamp-2 mb-1">{update.title}</h3>
                      {update.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{update.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute bottom-4 left-8 w-16 h-16 rounded-full bg-white/10" />
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of young changemakers already creating impact in their communities.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-white px-8 font-semibold text-primary shadow-lg hover:bg-white/90">
                <a href="/connect">
                  Join the Network
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white px-8 font-semibold text-white hover:bg-white/10">
                <a href="/collaborate#post-form">
                  Post a Collaboration
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <MemberSpotlight />
      <EventsCalendar />
      <FeaturedResources />
      <LatestUpdates />
      <CTABanner />
    </>
  );
}
