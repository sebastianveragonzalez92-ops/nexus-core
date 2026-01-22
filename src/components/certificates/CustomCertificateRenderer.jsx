import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CustomCertificateRenderer({ certificate, user, course, template }) {
  const certificateDate = certificate?.issued_date 
    ? format(new Date(certificate.issued_date), "d 'de' MMMM 'de' yyyy", { locale: es })
    : format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  const config = template?.config || {
    colors: { primary: '#6366f1', secondary: '#8b5cf6', text: '#1e293b', accent: '#f59e0b' },
    fonts: { title: 'serif', body: 'sans-serif' },
    layout: {
      userName: { fontSize: '48px', textAlign: 'center', marginTop: '80px' },
      courseTitle: { fontSize: '32px', textAlign: 'center', marginTop: '40px' },
      certificateNumber: { position: 'bottom-right', fontSize: '14px' },
      date: { position: 'bottom-left', fontSize: '14px' }
    },
    border: { style: 'solid', width: '4px', color: '#6366f1' }
  };

  const getPositionStyles = (position) => {
    const positions = {
      'bottom-left': { left: '60px', bottom: '60px', textAlign: 'left' },
      'bottom-right': { right: '60px', bottom: '60px', textAlign: 'right' },
      'bottom-center': { left: '50%', transform: 'translateX(-50%)', bottom: '60px', textAlign: 'center' }
    };
    return positions[position] || positions['bottom-right'];
  };

  return (
    <div 
      id="certificate-preview" 
      className="w-[1123px] h-[794px] relative overflow-hidden"
      style={{
        backgroundImage: template?.background_image_url ? `url(${template.background_image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: template?.background_image_url ? 'transparent' : '#ffffff'
      }}
    >
      {/* Border */}
      <div 
        className="absolute inset-8 p-16"
        style={{
          borderStyle: config.border.style,
          borderWidth: config.border.style !== 'none' ? config.border.width : '0',
          borderColor: config.border.color,
        }}
      >
        {/* Logo */}
        {template?.logo_url && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <img src={template.logo_url} alt="Logo" className="h-20 object-contain" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full relative">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="font-bold mb-2"
              style={{
                fontSize: '56px',
                color: config.colors.primary,
                fontFamily: config.fonts.title
              }}
            >
              Certificado
            </h1>
            <p 
              className="uppercase tracking-widest"
              style={{
                fontSize: '18px',
                color: config.colors.text,
                fontFamily: config.fonts.body
              }}
            >
              de Finalización
            </p>
          </div>

          {/* Body */}
          <div className="space-y-6 text-center">
            <p 
              style={{
                fontSize: '22px',
                color: config.colors.text,
                fontFamily: config.fonts.body
              }}
            >
              Se otorga el presente certificado a
            </p>

            <h2 
              className="font-bold"
              style={{
                fontSize: config.layout.userName.fontSize,
                color: config.colors.text,
                textAlign: config.layout.userName.textAlign,
                marginTop: config.layout.userName.marginTop,
                fontFamily: config.fonts.title
              }}
            >
              {user?.full_name || user?.email}
            </h2>

            <p 
              style={{
                fontSize: '22px',
                color: config.colors.text,
                fontFamily: config.fonts.body
              }}
            >
              Por completar exitosamente el curso
            </p>

            <h3 
              className="font-semibold px-12"
              style={{
                fontSize: config.layout.courseTitle.fontSize,
                color: config.colors.secondary,
                textAlign: config.layout.courseTitle.textAlign,
                marginTop: config.layout.courseTitle.marginTop,
                fontFamily: config.fonts.title
              }}
            >
              {course?.title}
            </h3>

            {certificate?.score && (
              <div 
                className="inline-block px-6 py-3 rounded-xl mt-6"
                style={{
                  backgroundColor: `${config.colors.accent}20`,
                  border: `2px solid ${config.colors.accent}`
                }}
              >
                <p 
                  className="font-semibold"
                  style={{
                    color: config.colors.accent,
                    fontFamily: config.fonts.body
                  }}
                >
                  Calificación: <span className="text-2xl font-bold">{certificate.score}%</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer - Date */}
          <div 
            className="absolute"
            style={{
              ...getPositionStyles(config.layout.date.position),
              fontSize: config.layout.date.fontSize,
              fontFamily: config.fonts.body
            }}
          >
            <p className="text-sm mb-1" style={{ color: config.colors.text, opacity: 0.7 }}>Fecha de emisión</p>
            <p className="font-semibold" style={{ color: config.colors.text }}>{certificateDate}</p>
          </div>

          {/* Footer - Certificate Number */}
          <div 
            className="absolute"
            style={{
              ...getPositionStyles(config.layout.certificateNumber.position),
              fontSize: config.layout.certificateNumber.fontSize,
              fontFamily: config.fonts.body
            }}
          >
            <p className="text-sm mb-1" style={{ color: config.colors.text, opacity: 0.7 }}>Certificado N°</p>
            <p className="font-mono font-semibold" style={{ color: config.colors.text }}>{certificate?.certificate_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}