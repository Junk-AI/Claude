import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ResourceDetailModal from "@/components/ResourceDetailModal";
import {
  BookOpen,
  ExternalLink,
  Download,
  Search,
  Lightbulb,
  FileText,
  Video,
  Wrench,
  Globe,
  Filter,
} from "lucide-react";

const RESOURCE_TYPES = ["Toolkits", "Reports", "Articles", "Case Studies"];

const typeIcons: Record<string, any> = {
  toolkits: Wrench,
  reports: FileText,
  articles: BookOpen,
  "case studies": Lightbulb,
};

const typeColors: Record<string, string> = {
  toolkits: "var(--brand-green)",
  reports: "var(--brand-blue)",
  articles: "var(--brand-purple)",
  "case studies": "var(--brand-orange)",
};

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

function ResourceCard({ resource, onViewDetails }: { resource: any; onViewDetails: (resource: any) => void }) {
  const type = resource.resourceType?.toLowerCase() || "other";
  const color = typeColors[type] || "var(--brand-purple)";
  const Icon = typeIcons[type] || Lightbulb;

  return (
    <motion.div variants={itemVariants}>
      <Card
        onClick={() => onViewDetails(resource)}
        className="card-lift rounded-2xl border-0 shadow-sm overflow-hidden bg-white h-full flex flex-col cursor-pointer transition-all hover:shadow-md"
      >
        <div className="h-1.5" style={{ background: color }} />
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              {resource.resourceType && (
                <Badge variant="outline" className="text-xs rounded-full mb-1 capitalize">
                  {resource.resourceType}
                </Badge>
              )}
              <h3 className="font-display font-bold text-base leading-snug">{resource.title}</h3>
            </div>
          </div>

          {resource.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">{resource.description}</p>
          )}

          <div className="mt-auto pt-3 border-t border-border">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(resource);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              View Details
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Create() {
  const { data: resources = [], isLoading } = trpc.resources.list.useQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (resource: any) => {
    setSelectedResource(resource);
    setIsDetailModalOpen(true);
  };

  const filtered = resources.filter((r) => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.resourceType?.toLowerCase() === typeFilter.toLowerCase();
    return matchSearch && matchType;
  });

  return (
    <div>
      {/* Header */}
      <section className="bg-hero py-14 sm:py-18 md:py-24">
        <div className="container">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <BookOpen className="w-4 h-4" />
              Create
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Resources & Tools
            </h1>
            <p className="text-foreground/70 text-lg leading-relaxed">
              Access guides, toolkits, templates, and resources to help you create impact in your community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container">
          {/* Search + Filters */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={typeFilter === "" ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setTypeFilter("")}
              >
                All
              </Button>
              {RESOURCE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => setTypeFilter(typeFilter === type ? "" : type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
          </motion.p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              className="text-center py-8 sm:py-12 md:py-16 rounded-2xl bg-secondary/50"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">No resources found.</p>
              {(search || typeFilter) && (
                <Button variant="link" size="sm" className="mt-2" onClick={() => { setSearch(""); setTypeFilter(""); }}>
                  Clear filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {filtered.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onViewDetails={handleViewDetails} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 md:py-16" style={{ background: "oklch(97% 0.02 240)" }}>
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--brand-green)" }}>
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Have a resource to share?</h2>
            <p className="text-muted-foreground mb-6">
              If you have a guide, toolkit, or resource that could help other young changemakers, reach out to us!
            </p>
            <a href="mailto:littlebutloud.kids@gmail.com">
              <Button className="rounded-full font-semibold px-8">
                Share a Resource
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
    </div>
  );
}
