export function Footer() {
  return (
    <footer
      className="bg-primary text-primary-foreground py-4 w-full"
      style={{ zIndex: 100, position: 'relative', background: 'var(--primary)' }}
    >
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
