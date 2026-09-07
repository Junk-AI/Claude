import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Download, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminEmailExport() {
  const [copied, setCopied] = useState(false);
  const { data: emails, isLoading } = trpc.members.getAllEmails.useQuery();

  const handleCopyEmails = () => {
    if (!emails || emails.length === 0) {
      toast.error("No emails to copy");
      return;
    }
    const emailList = emails.map((m) => m.email).join("; ");
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    toast.success(`Copied ${emails.length} emails to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (!emails || emails.length === 0) {
      toast.error("No emails to download");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Name", "Email"];
    const rows = emails.map((m) => [m.id, m.name, m.email]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `member-emails-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${emails.length} emails as CSV`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email All Network Members
        </CardTitle>
        <CardDescription>
          View and export email addresses of all approved network members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading member emails...</div>
        ) : !emails || emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No approved members with email addresses found</div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Total Members: {emails.length}
              </p>
              <p className="text-xs text-blue-700">
                These are all approved network members with valid email addresses
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCopyEmails}
                className="w-full flex items-center justify-center gap-2"
                variant="default"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy All Emails
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownloadCSV}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Download as CSV
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Member List</h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((member, idx) => (
                      <tr key={member.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-2">{member.name}</td>
                        <td className="px-4 py-2 text-blue-600 break-all">{member.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
