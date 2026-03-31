import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLandingData(hostname: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Look up domain
  const { data: domainData } = await supabase
    .from('custom_domains')
    .select('landing_page_id')
    .eq('domain', hostname)
    .eq('status', 'active')
    .maybeSingle();

  if (!domainData) return null;

  // Get landing page with product
  const { data: landing } = await supabase
    .from('landing_pages')
    .select('*, products(*)')
    .eq('id', domainData.landing_page_id)
    .maybeSingle();

  return landing;
}

export default async function Page() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];

  const landing = await getLandingData(hostname);

  if (!landing) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'sans-serif' }}>
        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:'2rem', marginBottom:'1rem' }}>🔍 Страница не найдена</h1>
          <p style={{ color:'#666' }}>Домен <strong>{hostname}</strong> не привязан ни к одной странице.</p>
        </div>
      </div>
    );
  }

  const product = (landing as any).products;
  const content = product?.generated_content || {};
  const colors = landing.custom_colors || {};
  const images = product?.images || [];

  const primaryColor = (colors as any)?.primary || '#e53e3e';
  const bgColor = (colors as any)?.background || '#ffffff';
  const textColor = (colors as any)?.text || '#1a202c';

  return (
    <div style={{ fontFamily:'system-ui, sans-serif', backgroundColor: bgColor, color: textColor, minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1rem' }}>
        {images.length > 0 && (
          <img 
            src={images[0]} 
            alt={product?.name || ''} 
            style={{ width:'100%', maxHeight:'500px', objectFit:'cover', borderRadius:'12px', marginBottom:'1.5rem' }}
          />
        )}
        
        <h1 style={{ fontSize:'2rem', fontWeight:'bold', marginBottom:'1rem' }}>
          {(content as any)?.hero?.title || product?.name || 'Продукт'}
        </h1>
        
        <p style={{ fontSize:'1.1rem', lineHeight:'1.6', marginBottom:'2rem', color: textColor + 'cc' }}>
          {(content as any)?.hero?.subtitle || product?.description || ''}
        </p>
        
        <div style={{ 
          backgroundColor: primaryColor, 
          color: '#fff', 
          padding:'1rem 2rem', 
          borderRadius:'12px',
          textAlign:'center',
          fontSize:'1.2rem',
          fontWeight:'bold'
        }}>
          {product?.base_price ? product.base_price + ' BYN' : ''}
        </div>

        {/* Benefits */}
        {(content as any)?.benefits && (
          <div style={{ marginTop:'2rem' }}>
            <h2 style={{ fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem' }}>Преимущества</h2>
            <ul style={{ listStyle:'none', padding:0 }}>
              {((content as any).benefits as any[])?.map((b: any, i: number) => (
                <li key={i} style={{ padding:'0.75rem 0', borderBottom:'1px solid #eee' }}>
                  ✅ {typeof b === 'string' ? b : b.text || b.title || ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Testimonials */}
        {(content as any)?.testimonials && (
          <div style={{ marginTop:'2rem' }}>
            <h2 style={{ fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem' }}>Отзывы</h2>
            {((content as any).testimonials as any[])?.map((t: any, i: number) => (
              <div key={i} style={{ backgroundColor:'#f7f7f7', borderRadius:'12px', padding:'1rem', marginBottom:'1rem' }}>
                <p style={{ fontStyle:'italic', marginBottom:'0.5rem' }}>"{t.text || t.review || ''}"</p>
                <p style={{ fontWeight:'bold', fontSize:'0.9rem' }}>— {t.name || t.author || 'Клиент'}</p>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        {(content as any)?.faq && (
          <div style={{ marginTop:'2rem' }}>
            <h2 style={{ fontSize:'1.5rem', fontWeight:'bold', marginBottom:'1rem' }}>Частые вопросы</h2>
            {((content as any).faq as any[])?.map((f: any, i: number) => (
              <div key={i} style={{ marginBottom:'1rem' }}>
                <p style={{ fontWeight:'bold' }}>{f.question || f.q || ''}</p>
                <p style={{ color: textColor + 'aa', marginTop:'0.25rem' }}>{f.answer || f.a || ''}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:'3rem', padding:'2rem 0', color:'#999', fontSize:'0.85rem' }}>
          Powered by Funnels.by
        </div>
      </div>
    </div>
  );
}
