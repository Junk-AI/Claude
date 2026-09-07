import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div>
      {/* Header */}
      <section className="bg-hero py-12 md:py-16">
        <div className="container">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Terms of Service</h1>
          <p className="text-foreground/70 mt-2">Last updated: May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="prose prose-sm max-w-none space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-foreground/70">
                By accessing and using the Network of Deeds by Kids website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">2. Use License</h2>
              <p className="text-foreground/70 mb-2">Permission is granted to temporarily download one copy of the materials (information or software) on the Network of Deeds by Kids website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">3. Disclaimer</h2>
              <p className="text-foreground/70">
                The materials on the Network of Deeds by Kids website are provided on an 'as is' basis. Little But Loud makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">4. Limitations</h2>
              <p className="text-foreground/70">
                In no event shall Little But Loud or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Network of Deeds by Kids website.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">5. Accuracy of Materials</h2>
              <p className="text-foreground/70">
                The materials appearing on the Network of Deeds by Kids website could include technical, typographical, or photographic errors. Little But Loud does not warrant that any of the materials on its website are accurate, complete, or current. Little But Loud may make changes to the materials contained on its website at any time without notice.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">6. Links</h2>
              <p className="text-foreground/70">
                Little But Loud has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Little But Loud of the site. Use of any such linked website is at the user's own risk.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">7. Modifications</h2>
              <p className="text-foreground/70">
                Little But Loud may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">8. Contact Us</h2>
              <p className="text-foreground/70">
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:info@littlebutloud.org" className="text-primary hover:underline">
                  info@littlebutloud.org
                </a>
              </p>
            </div>

            <div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/privacy">
                <Button variant="outline" className="rounded-full w-full sm:w-auto">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/manage-data">
                <Button variant="outline" className="rounded-full w-full sm:w-auto">
                  Manage Your Data
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
