export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-20 relative">
      {/* Top overlay to cover lower portion of margin (40px) */}
      <div className="absolute left-0 right-0 -top-10 h-10 bg-primary z-50 pointer-events-none" />

      <div className="container mx-auto px-4 text-center relative z-30">
        <p className="text-sm">
          Created by Brian Alewine{" "}
          <a href="mailto:rpt2fx@virginia.edu" className="underline hover:text-secondary transition-colors">
            rpt2fx@virginia.edu
          </a>
        </p>
      </div>
    </footer>
  )
}
