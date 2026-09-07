import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, X, FileText, Loader } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ResourceDetailModalProps {
  resource: {
    id: number;
    title: string;
    description?: string;
    resourceType?: string;
    link?: string;
    fileUrl?: string;
    featured?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  toolkits: "var(--brand-green)",
  reports: "var(--brand-blue)",
  articles: "var(--brand-purple)",
  "case studies": "var(--brand-orange)",
};

export default function ResourceDetailModal({ resource, isOpen, onClose }: ResourceDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfCanvas, setPdfCanvas] = useState<HTMLCanvasElement | null>(null);

  const type = resource.resourceType?.toLowerCase() || "other";
  const color = typeColors[type] || "var(--brand-purple)";
  
  // Fixed logic: check for fileUrl first (uploaded file)
  const isUploadedFile = !!resource.fileUrl;
  const isLink = !!resource.link && !isUploadedFile; // Only treat as link if no fileUrl
  const isPdf = isUploadedFile && resource.fileUrl?.toLowerCase().endsWith(".pdf");

  // Load PDF when modal opens and resource is a PDF
  useEffect(() => {
    if (!isOpen || !isPdf || !resource.fileUrl) {
      setPdfPages(0);
      setCurrentPage(1);
      setPdfError(null);
      return;
    }

    const loadPdf = async () => {
      setPdfLoading(true);
      setPdfError(null);
      try {
        const response = await fetch(resource.fileUrl!);
        if (!response.ok) throw new Error("Failed to load PDF");
        
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfPages(pdf.numPages);
        setCurrentPage(1);

        // Render first page
        renderPage(pdf, 1);
      } catch (error) {
        console.error("PDF loading error:", error);
        setPdfError("Failed to load PDF preview");
      } finally {
        setPdfLoading(false);
      }
    };

    loadPdf();
  }, [isOpen, isPdf, resource.fileUrl]);

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Failed to get canvas context");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      setPdfCanvas(canvas);
    } catch (error) {
      console.error("Page rendering error:", error);
      setPdfError("Failed to render PDF page");
    }
  };

  const handlePageChange = async (direction: "next" | "prev") => {
    if (!resource.fileUrl) return;

    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (newPage < 1 || newPage > pdfPages) return;

    setCurrentPage(newPage);
    setPdfLoading(true);

    try {
      const response = await fetch(resource.fileUrl);
      if (!response.ok) throw new Error("Failed to load PDF");

      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      await renderPage(pdf, newPage);
    } catch (error) {
      console.error("Page navigation error:", error);
      setPdfError("Failed to load page");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resource.fileUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(resource.fileUrl);
      if (!response.ok) throw new Error("Failed to download file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Extract filename from URL or use resource title
      const urlParts = resource.fileUrl.split("/");
      const filename = urlParts[urlParts.length - 1] || resource.title || "resource";
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInDrive = () => {
    if (!resource.link) return;
    window.open(resource.link, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {resource.resourceType && (
                  <Badge variant="outline" className="text-xs rounded-full capitalize">
                    {resource.resourceType}
                  </Badge>
                )}
                {resource.featured && (
                  <Badge className="text-xs rounded-full bg-yellow-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl font-bold">{resource.title}</DialogTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {resource.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">
                {resource.description}
              </p>
            </div>
          )}

          {/* Document Viewer */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Document</h3>
            <div className="border border-border rounded-xl overflow-hidden bg-muted">
              {isUploadedFile && resource.fileUrl ? (
                <>
                  {isPdf ? (
                    // PDF Preview
                    <div className="space-y-4">
                      {pdfLoading ? (
                        <div className="flex items-center justify-center p-8 min-h-96 bg-muted">
                          <div className="text-center">
                            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading PDF...</p>
                          </div>
                        </div>
                      ) : pdfError ? (
                        <div className="flex items-center justify-center p-8 min-h-96 bg-muted">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center mx-auto mb-4" style={{ background: `${color}18` }}>
                              <FileText className="w-8 h-8" style={{ color }} />
                            </div>
                            <p className="font-semibold text-foreground mb-2">PDF Preview Unavailable</p>
                            <p className="text-sm text-muted-foreground mb-4">{pdfError}</p>
                            <p className="text-xs text-muted-foreground">Use the download button to view the full document</p>
                          </div>
                        </div>
                      ) : pdfCanvas ? (
                        <div className="flex flex-col items-center bg-muted p-4">
                          <canvas
                            ref={(el) => {
                              if (el && pdfCanvas) {
                                el.getContext("2d")?.drawImage(pdfCanvas, 0, 0);
                              }
                            }}
                            className="max-w-full border border-border rounded-lg shadow-lg"
                          />
                          {pdfPages > 1 && (
                            <div className="flex items-center gap-4 mt-4">
                              <Button
                                onClick={() => handlePageChange("prev")}
                                disabled={currentPage === 1 || pdfLoading}
                                variant="outline"
                                size="sm"
                              >
                                Previous
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {pdfPages}
                              </span>
                              <Button
                                onClick={() => handlePageChange("next")}
                                disabled={currentPage === pdfPages || pdfLoading}
                                variant="outline"
                                size="sm"
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    // Non-PDF File
                    <div className="flex items-center justify-center p-8 min-h-96 bg-muted">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center mx-auto mb-4" style={{ background: `${color}18` }}>
                          <Download className="w-8 h-8" style={{ color }} />
                        </div>
                        <p className="font-semibold text-foreground mb-2">Uploaded Document</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click the download button below to view the full document
                        </p>
                        <p className="text-xs text-muted-foreground">
                          File: {resource.fileUrl.split("/").pop()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : isLink && resource.link ? (
                <div className="flex items-center justify-center p-8 min-h-96 bg-muted">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center mx-auto mb-4" style={{ background: `${color}18` }}>
                      <ExternalLink className="w-8 h-8" style={{ color }} />
                    </div>
                    <p className="font-semibold text-foreground mb-2">External Link</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This resource is hosted externally
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {resource.link}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 min-h-96 bg-muted">
                  <p className="text-muted-foreground">No document available</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-background pt-4 border-t border-border">
            {isUploadedFile && resource.fileUrl && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 rounded-full gap-2"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
            )}
            {isLink && resource.link && (
              <Button
                onClick={handleOpenInDrive}
                variant="outline"
                className="flex-1 rounded-full gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Drive
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="rounded-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
