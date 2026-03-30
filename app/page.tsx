import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://svurcdtsmnoiqtzddzcj.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dXJjZHRzbW5vaXF0emRkemNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTIzMzgsImV4cCI6MjA4OTg2ODMzOH0.m5-GcjZQjwItqg1iZgBJeaBDiN2uL7hUJWO6hEcWEsg";

export const dynamic = "force-dynamic";

async function getLandingData(hostname: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: domainData } = await supabase
    .from("custom_domains").select("landing_page_id")
    .eq("domain", hostname).eq("status", "active").maybeSingle();
  if (!domainData) return null;
  const { data: landing } = await supabase
    .from("landing_pages").select("*, products(*)")
    .eq("id", domainData.landing_page_id).maybeSingle();
  return landing;
}

export default async function Page() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const hostname = host.split(":")[0];
  const landing = await getLandingData(hostname);

  if (!landing) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <h1 style={{ fontSize:"2rem", marginBottom:"1rem" }}>Страница не найдена</h1>
          <p style={{ color:"#666" }}>Домен <strong>{hostname}</strong> не привязан ни к одной странице.</p>
        </div>
      </div>
    );
  }

  const product = (landing as any).products;
  const content = product?.generated_content || {};
  const colors = landing.custom_colors || {};
  const images = product?.images || [];
  const primaryColor = (colors as any)?.primary || "#e53e3e";

  return (
    <div style={{ fontFamily:"system-ui, sans-serif", minHeight:"100vh" }}>
      <div style={{ maxWidth:"800px", margin:"0 auto", padding:"2rem 1rem" }}>
        {images.length > 0 && (
          <img src={images[0]} alt={product?.name || ""} style={{ width:"100%", maxHeight:"500px", objectFit:"cover", borderRadius:"12px", marginBottom:"1.5rem" }} />
        )}
        <h1 style={{ fontSize:"2rem", fontWeight:"bold", marginBottom:"1rem" }}>
          {(content as any)?.hero?.title || product?.name || "Продукт"}
        </h1>
        <p style={{ fontSize:"1.1rem", lineHeight:"1.6", marginBottom:"2rem" }}>
          {(content as any)?.hero?.subtitle || product?.description || ""}
        </p>
        <div style={{ backgroundColor:primaryColor, color:"#fff", padding:"1rem 2rem", borderRadius:"12px", textAlign:"center", fontSize:"1.2rem", fontWeight:"bold" }}>
          {product?.base_price ? product.base_price + " BYN" : ""}
        </div>
        <div style={{ textAlign:"center", marginTop:"3rem", padding:"2rem 0", color:"#999", fontSize:"0.85rem" }}>
          Powered by Funnels.by
        </div>
      </div>
    </div>
  );
}
