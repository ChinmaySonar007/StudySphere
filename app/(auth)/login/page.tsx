import GlassBackground from "@/components/effects/GlassBackground";
import AnimatedGrid from "@/components/effects/AnimatedGrid";
import MouseGlow from "@/components/effects/MouseGlow";

import AuthShowcase from "@/components/auth/AuthShowcase";
import LoginCard from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <GlassBackground>
      <MouseGlow />
      <AnimatedGrid />


      <main className="relative z-10 flex min-h-screen">
        <AuthShowcase />
        <LoginCard />
      </main>
    </GlassBackground>
  );
}