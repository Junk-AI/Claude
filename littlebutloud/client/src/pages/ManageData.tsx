import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ManageData() {
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
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Manage Your Data</h1>
          <p className="text-foreground/70 mt-2">Control how your information is used</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="prose prose-sm max-w-none space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Your Data Rights</h2>
              <p className="text-foreground/70">
                At Little But Loud, we respect your privacy and give you control over your personal data. This page explains how you can manage your information.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">What Data We Collect</h2>
              <p className="text-foreground/70 mb-2">When you join our network, we collect:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Profile information (name, age, location, organization)</li>
                <li>Contact details (email, social media handles)</li>
                <li>Professional interests (issue areas, member type)</li>
                <li>Profile photos and cover images</li>
                <li>Your story and description</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">How We Use Your Data</h2>
              <p className="text-foreground/70 mb-2">Your data helps us:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Connect you with like-minded changemakers and organizations</li>
                <li>Send you updates about events and opportunities</li>
                <li>Improve our platform and services</li>
                <li>Facilitate collaboration and networking</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Your Choices</h2>
              <p className="text-foreground/70 mb-2">You have the following options:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li><strong>Update Your Profile:</strong> Log in to edit your information at any time</li>
                <li><strong>Control Marketing Communications:</strong> Opt out of promotional emails</li>
                <li><strong>Data Sharing:</strong> Choose whether to share your data with partner organizations</li>
                <li><strong>Request Deletion:</strong> Contact us to request deletion of your account and data</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Data Retention</h2>
              <p className="text-foreground/70">
                We retain your data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required by law to retain it.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold mb-3">Contact Us</h2>
              <p className="text-foreground/70">
                If you have questions about your data or wish to exercise your rights, please contact us at{" "}
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
              <Link href="/terms">
                <Button variant="outline" className="rounded-full w-full sm:w-auto">
                  Terms of Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
