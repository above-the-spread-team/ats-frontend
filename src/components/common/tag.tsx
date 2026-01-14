export default function Tag({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="px-2 py-1 rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
