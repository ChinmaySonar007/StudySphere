import AuroraBackground from "@/components/effects/AuroraBackground";
import AnimatedGrid from "@/components/effects/AnimatedGrid";
import MouseGlow from "@/components/effects/MouseGlow";

import AuthShowcase from "@/components/auth/AuthShowcase";
import SignupCard from "@/components/auth/SignupCard";

export default function SignupPage() {
  return (
    <AuroraBackground>
      <AnimatedGrid />
      <MouseGlow />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-16">
          <AuthShowcase />
          <SignupCard />
        </div>
      </main>
    </AuroraBackground>
  );
}