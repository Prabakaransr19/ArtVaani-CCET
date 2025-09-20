
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Privacy Policy | ArtVaani',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-2xl soft-shadow">
          <CardHeader>
            <CardTitle className="text-4xl font-headline text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground leading-relaxed">
            
            <p className="text-center">We value your trust and are committed to protecting your privacy.</p>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Information Collection</h3>
              <p>We collect basic user information such as name, email, phone number, and location during registration. For artisans, we may request additional details about their craft for verification.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Use of Information</h3>
              <p>Your data is used to provide core services—such as managing profiles, facilitating product listings, enabling purchases, and ensuring authenticity of artisan accounts.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Data Security</h3>
              <p>We use Firebase Authentication and Firestore with industry-standard security practices to safeguard user data.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Third-Party Services</h3>
              <p>We integrate Google services (OAuth, AI models, and translations) to enhance your experience. These services may collect limited data as per their policies.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">User Rights</h3>
              <p>You may update or delete your account information at any time through your profile settings.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Children’s Privacy</h3>
              <p>ArtVaani is not intended for users under 13 years of age.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Policy Updates</h3>
              <p>This policy may be updated periodically. Users will be notified of major changes.</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
