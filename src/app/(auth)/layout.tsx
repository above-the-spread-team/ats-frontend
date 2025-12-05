import AuthHeader from "./_components/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" min-h-screen py-14 flex flex-col relative ">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('/images/auth.jpg')",
        }}
      />
      {/* Optional overlay for better readability */}
      <div className="fixed inset-0 bg-black/20 -z-10" />

      <AuthHeader />
      <div className="flex-1 flex items-center justify-center relative z-0">
        {children}
      </div>
    </div>
  );
}
