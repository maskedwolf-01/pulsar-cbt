import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// FIXED: Removed "default". It must be a named export.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Glowing Background Effect */}
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 50% 50%, #7cffd910 0%, transparent 50%)',
            }}
        />

        {/* Logo Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #7cffd9, #3b82f6)',
            boxShadow: '0 0 50px -10px rgba(124, 255, 217, 0.5)',
            marginBottom: '40px',
            color: '#000',
            fontSize: '60px',
            fontWeight: 900,
          }}
        >
          P
        </div>

        {/* Main Title */}
        <div
          style={{
            color: 'white',
            fontSize: 70,
            fontStyle: 'normal',
            fontWeight: 'bold',
            lineHeight: 1.1,
            marginBottom: 20,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Pulsar CBT
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: '#a1a1aa',
            fontSize: 32,
            fontStyle: 'normal',
            fontWeight: 'normal',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          The #1 Practice Platform for FUOYE Students
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', marginTop: '40px', gap: '20px' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '50px', color: '#7cffd9', fontSize: 24 }}>GST 101</div>
            <div style={{ padding: '10px 20px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '50px', color: '#60a5fa', fontSize: 24 }}>MTH 101</div>
            <div style={{ padding: '10px 20px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '50px', color: '#f472b6', fontSize: 24 }}>PHY 101</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
            }
        
