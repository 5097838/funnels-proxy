import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function Page() {
  const host = headers().get('host') || '';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div>
        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Домен не настроен</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Для домена <strong>{host}</strong> не найден активный лендинг.
        </p>
      </div>
    </div>
  );
}