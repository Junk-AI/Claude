import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Privacy Policy</h1>
          <p className="text-foreground/70 mt-2">Last updated: May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="prose prose-sm max-w-none space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">1. Introduction</h2>
              <p className="text-foreground/70">
                Little But Loud ("we", "our", or "us") operates the Network of Deeds by Kids website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">2. Information Collection and Use</h2>
              <p className="text-foreground/70 mb-2">We collect several different types of information for various purposes to provide and improve our service to you.</p>
              <h3 className="font-semibold text-lg mb-2">Types of Data Collected:</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Personal Information: Name, email address, age, location, organization details</li>
                <li>Profile Information: Initiative name, issue areas, description, social media handles</li>
                <li>Images: Profile photos and cover images you choose to upload</li>
                <li>Usage Data: Information about how you interact with our platform</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">3. Use of Data</h2>
              <p className="text-foreground/70">Little But Loud uses the collected data for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70 mt-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To allow you to participate in interactive features of our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so we can improve our service</li>
                <li>To monitor the usage of our service</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">4. Security of Data</h2>
              <p className="text-foreground/70">
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">5. Contact Us</h2>
              <p className="text-foreground/70">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:info@littlebutloud.org" className="text-primary hover:underline">
                  info@littlebutloud.org
                </a>
              </p>
            </div>

            <div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/terms">
                <Button variant="outline" className="rounded-full w-full sm:w-auto">
                  Terms of Service
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
