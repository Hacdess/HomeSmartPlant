export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return(
    <footer className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 py-8 mt-16 border-t border-border">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground text-center">
          © {currentYear} SmartPlant. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Phát triển bởi Nhóm 7 - 23clc09
        </p>
      </div>
    </footer>
  )
}