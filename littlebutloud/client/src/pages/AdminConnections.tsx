import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, MessageSquare, Building2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminConnections() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { data: requests, isLoading } = trpc.connections.adminList.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Connection Requests</h1>
          <p className="text-muted-foreground">
            Manage all connection requests between members
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">
                {requests?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total Requests</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">
                {requests?.filter((r: any) => r.status === "sent").length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Sent</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">
                {requests?.filter((r: any) => r.status === "pending").length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request: any) => (
              <Card
                key={request.id}
                className="border-0 shadow-sm hover:shadow-md transition-all bg-white cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.requesterName}
                          </h3>
                          {request.requesterOrganisation && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" />
                              {request.requesterOrganisation}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Connection Flow */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="font-medium">From:</span>
                        <span className="text-muted-foreground">{request.requesterName}</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span className="font-medium">To:</span>
                        <span className="text-muted-foreground">Member ID: {request.toMemberId}</span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Mail className="w-4 h-4" />
                        {request.requesterEmail}
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-foreground/80 line-clamp-2">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Created: {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Updated: {new Date(request.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No connection requests yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connection Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* From */}
              <div>
                <h3 className="font-semibold mb-2">From</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium">{selectedRequest.requesterName}</p>
                  {selectedRequest.requesterOrganisation && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.requesterOrganisation}
                    </p>
                  )}
                  <p className="text-sm text-primary flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedRequest.requesterEmail}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedRequest.message && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.charAt(0).toUpperCase() +
                    selectedRequest.status.slice(1)}
                </Badge>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Updated</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setSelectedRequest(null)}
                variant="outline"
                className="w-full rounded-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
