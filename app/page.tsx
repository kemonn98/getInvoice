import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b bg-background py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">Invoice</span>Generator
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex flex-col items-center justify-center gap-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">Create professional invoices in seconds</h1>
          <p className="text-lg text-muted-foreground">
            Generate, manage, and send invoices to your clients with our easy-to-use invoice generator.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            {
              title: "Google Auth",
              description: "Quick and secure login",
            },
            {
              title: "Templates",
              description: "Professional designs",
            },
            {
              title: "PDF Export",
              description: "Easy file sharing",
            },
            {
              title: "Client Manager",
              description: "Store client details",
            },
          ].map((feature, index) => (
            <div key={index} className="rounded-lg border bg-background p-4 text-center">
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-4">
        <div className="container flex items-center justify-between">
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Invoice Generator</div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

