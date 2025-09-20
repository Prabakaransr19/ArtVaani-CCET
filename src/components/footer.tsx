import { Logo } from "@/components/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
                <Logo className="h-8 w-auto text-primary" />
            </Link>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ArtVaani. All rights reserved.</p>
            <nav className="flex gap-4">
                <Link href="/about" className="text-sm hover:text-primary">About</Link>
                <Link href="/contact" className="text-sm hover:text-primary">Contact</Link>
                <Link href="/privacy" className="text-sm hover:text-primary">Privacy Policy</Link>
            </nav>
        </div>
      </div>
    </footer>
  );
}
