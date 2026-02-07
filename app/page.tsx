import Link from "next/link";

/** Mini Kanban: 3 columns with card blocks */
function BoardsIllustration() {
  return (
    <div
      className="flex gap-2 rounded-lg border border-[#E4EBFA] bg-[#F4F7FD] p-4 sm:p-5"
      aria-hidden
    >
      {[
        { label: "To Do", cards: 2, color: "bg-[#E4EBFA]" },
        { label: "Doing", cards: 1, color: "bg-[#635FC7]/20" },
        { label: "Done", cards: 2, color: "bg-[#E4EBFA]" },
      ].map((col) => (
        <div key={col.label} className="flex w-20 flex-col gap-2 sm:w-24">
          <div className="h-2 w-full rounded bg-[#828FA3]/40" />
          {Array.from({ length: col.cards }).map((_, i) => (
            <div
              key={i}
              className={`h-8 w-full rounded-md border border-[#E4EBFA] ${col.color}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Two columns with a card “in flight” between them (drag-and-drop) */
function CardsIllustration() {
  return (
    <div
      className="relative flex gap-3 rounded-lg border border-[#E4EBFA] bg-[#F4F7FD] p-4 sm:p-5"
      aria-hidden
    >
      {/* Source column */}
      <div className="flex w-20 flex-col gap-2 sm:w-24">
        <div className="h-1.5 w-full rounded bg-[#828FA3]/30" />
        <div className="h-7 w-full rounded-md border border-[#E4EBFA] bg-white" />
        <div className="h-7 w-full rounded-md border border-[#E4EBFA] bg-white" />
      </div>
      {/* Card being dragged + arrow */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
        <div className="rounded-md border-2 border-[#635FC7] bg-white px-3 py-2 shadow-lg">
          <div className="h-2 w-12 rounded bg-[#000112]/80" />
          <div className="mt-1 h-1 w-8 rounded bg-[#828FA3]/50" />
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#635FC7" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      {/* Target column */}
      <div className="flex w-20 flex-col gap-2 sm:w-24">
        <div className="h-1.5 w-full rounded bg-[#828FA3]/30" />
        <div className="h-7 w-full rounded-md border border-[#E4EBFA] bg-white" />
        <div className="h-7 rounded-md border-2 border-dashed border-[#635FC7]/50 bg-[#635FC7]/5" />
        <div className="h-7 w-full rounded-md border border-[#E4EBFA] bg-white" />
      </div>
    </div>
  );
}

/** Search / filter cue */
function SearchIllustration() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-[#E4EBFA] bg-[#F4F7FD] px-4 py-3 sm:px-5 sm:py-4"
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#828FA3" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <div className="flex-1 space-y-2">
        <div className="h-2 w-full rounded bg-[#E4EBFA]" />
        <div className="flex gap-2">
          <div className="h-1.5 w-12 rounded-full bg-[#635FC7]/40" />
          <div className="h-1.5 w-10 rounded-full bg-[#E4EBFA]" />
          <div className="h-1.5 w-8 rounded-full bg-[#E4EBFA]" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E4EBFA] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between px-6 sm:h-16">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#000112] sm:text-xl"
          >
            Xanban
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="rounded-[20px] border border-[#E4EBFA] bg-transparent px-4 py-2 text-[13px] font-medium text-[#635FC7] transition-colors hover:bg-[#F4F7FD] hover:border-[#635FC7]/30 sm:px-5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-[20px] bg-[#635FC7] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#A8A4FF] sm:px-5"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — single column, Raycast-style */}
      <main className="flex flex-1 flex-col items-center px-6 pb-20 pt-16 sm:pt-24 md:pt-28">
        <div className="mx-auto w-full max-w-[640px] text-center">
          <h1 className="text-[28px] font-bold leading-[1.26] tracking-tight text-[#000112] sm:text-[32px] md:text-[40px]">
            Task management that stays out of your way
          </h1>
          <p className="mt-5 text-[13px] font-medium leading-[1.77] text-[#828FA3] sm:text-[15px]">
            Boards, columns, and cards. Drag, drop, and ship. Simple Kanban for
            getting things done—without the clutter.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="w-full rounded-[24px] bg-[#635FC7] px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#A8A4FF] sm:w-auto"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-[24px] border border-[#E4EBFA] bg-white px-6 py-3.5 text-[15px] font-bold text-[#635FC7] transition-colors hover:bg-[#F4F7FD] sm:w-auto"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Features — B-A-Z pattern: text / illustration alternating, centered */}
        <section className="mx-auto mt-24 w-full px-0 sm:mt-32">
          <h2 className="sr-only">What you get</h2>

          {/* Row 1: Text left, illustration right — stick to column edges */}
          <div className="border-b border-[#E4EBFA] py-12 sm:py-16">
            <div className="mx-auto grid w-full max-w-3xl items-center gap-6 sm:grid-cols-2 sm:gap-8 md:gap-10">
              <div className="order-2 sm:order-1 sm:justify-self-start">
                <h3 className="text-[18px] font-bold leading-[1.27] text-[#000112] sm:text-[20px]">
                  Boards & columns
                </h3>
                <p className="mt-3 text-[13px] font-medium leading-[1.77] text-[#828FA3] sm:text-[14px]">
                  Organize work your way. Default To Do, In Progress, Done—or
                  customize stages.
                </p>
              </div>
              <div className="order-1 sm:order-2 sm:justify-self-end">
                <BoardsIllustration />
              </div>
            </div>
          </div>

          {/* Row 2: Illustration left, text right — stick to column edges */}
          <div className="border-b border-[#E4EBFA] py-12 sm:py-16">
            <div className="mx-auto grid w-full max-w-3xl items-center gap-6 sm:grid-cols-2 sm:gap-8 md:gap-10">
              <div className="sm:justify-self-start">
                <CardsIllustration />
              </div>
              <div className="sm:justify-self-end">
                <h3 className="text-[18px] font-bold leading-[1.27] text-[#000112] sm:text-[20px]">
                  Cards & drag-and-drop
                </h3>
                <p className="mt-3 text-[13px] font-medium leading-[1.77] text-[#828FA3] sm:text-[14px]">
                  Tasks as cards. Move them between columns with a drag. Titles,
                  due dates, labels.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Text left, illustration right — stick to column edges */}
          <div className="py-12 sm:py-16">
            <div className="mx-auto grid w-full max-w-3xl items-center gap-6 sm:grid-cols-2 sm:gap-8 md:gap-10">
              <div className="order-2 sm:order-1 sm:justify-self-start">
                <h3 className="text-[18px] font-bold leading-[1.27] text-[#000112] sm:text-[20px]">
                  Search & filter
                </h3>
                <p className="mt-3 text-[13px] font-medium leading-[1.77] text-[#828FA3] sm:text-[14px]">
                  Find tasks by label, due date, or priority. Keep the board clean;
                  find what matters.
                </p>
              </div>
              <div className="order-1 sm:order-2 sm:justify-self-end">
                <SearchIllustration />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-[#E4EBFA] bg-white">
        <div className="mx-auto flex max-w-[720px] items-center justify-center px-6 py-6">
          <p className="text-[12px] font-medium text-[#828FA3]">
            © {new Date().getFullYear()} Xanban. Task management, simplified.
          </p>
        </div>
      </footer>
    </div>
  );
}
