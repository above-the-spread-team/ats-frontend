import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sticky top-0 flex flex-col gap-2   bg-red-500">
        <Link href="/discuss">All Posts</Link>
      <Link href="/discuss/create-group">Create Group</Link>
      <Link href="/discuss/search-group">Search Group</Link>
    </div>
  );
}