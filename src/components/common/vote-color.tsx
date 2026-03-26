interface VoteColorProps {
  className?: string;
  textClassName?: string;
}

const VOTE_COLOR_ITEMS = [
  { label: "Home", color: "bg-vote-blue" },
  { label: "Draw", color: "bg-vote-yellow" },
  { label: "Away", color: "bg-vote-red" },
];

export default function VoteColor({
  className = "",
  textClassName = "text-muted-foreground",
}: VoteColorProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {VOTE_COLOR_ITEMS.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1 text-[11px] ${textClassName}`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${item.color}`}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
