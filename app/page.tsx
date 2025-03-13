import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
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
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Create professional invoices <br className="hidden sm:inline" />
              in seconds
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Generate, manage, and send invoices to your clients with our easy-to-use invoice generator. Sign in with
              Google to get started.
            </p>
          </div>
          <div className="flex gap-4">
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
          <div className="mt-8 w-full overflow-hidden rounded-lg border bg-background shadow-xl">
            <img
              src="/placeholder.svg?height=600&width=1200"
              alt="Invoice Generator Dashboard Preview"
              className="w-full object-cover"
            />
          </div>
        </section>
        <section id="features" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features that make invoicing simple
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our invoice generator provides all the tools you need to create professional invoices quickly and
                easily.
              </p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  title: "Google Authentication",
                  description: "Securely log in with your Google account for quick access to your invoices.",
                },
                {
                  title: "Customizable Templates",
                  description: "Choose from a variety of professional templates to match your brand.",
                },
                {
                  title: "PDF Export",
                  description: "Download your invoices as PDF files to share with clients.",
                },
                {
                  title: "Client Management",
                  description: "Store client information for faster invoice creation.",
                },
              ].map((feature, index) => (
                <div key={index} className="rounded-lg border bg-background p-6 shadow-sm">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Invoice Generator. All rights reserved.
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

