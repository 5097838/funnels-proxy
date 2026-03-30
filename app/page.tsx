import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://svurcdtsmnoiqtzddzcj.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dXJjZHRzbW5vaXF0emRkemNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTIzMzgsImV4cCI6MjA4OTg2ODMzOH0.m5-GcjZQjwItqg1iZgBJeaBDiN2uL7hUJWO6hEcWEsg";
const platformUrl = process.env.PLATFORM_URL || "https://boost-sell-speed.lovable.app";

export const dynamic = "force-dynamic";

async function getLandingSlug(hostname: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: domainData } = await supabase
    .from("custom_domains")
    .select("landing_page_id")
    .eq("domain", hostname)
    .eq("status", "active")
    .maybeSingle();
  if (!domainData) return null;
  const { data: landing } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", domainData.landing_page_id)
    .maybeSingle();
  return landing?.slug || null;
}

export default async function Page() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const hostname = host.split(":")[0];
  const slug = await getLandingSlug(hostname);

  if (!slug) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <h1 style={{ fontSize:"2rem", marginBottom:"1rem" }}>Страница не найдена</h1>
          <p style={{ color:"#666" }}>Домен <strong>{hostname}</strong> не привязан ни к одной странице.</p>
        </div>
      </div>
    );
  }

  const iframeSrc = `${platformUrl}/p/${slug}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
      ` }} />
      <iframe
        src={iframeSrc}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
          display: "block",
        }}
        allow="payment"
      />
    </>
  );
}
