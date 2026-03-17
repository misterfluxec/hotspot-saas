import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessType } = await request.json();

    // Simular respuesta de Ollama
    const suggestions = {
      restaurante: {
        title: 'Bienvenido a nuestro Restaurante',
        subtitle: 'Conéctate y disfruta de nuestro WiFi mientras saboreas nuestros platillos',
        welcomeMessage: 'Accede a nuestra red WiFi para recibir ofertas exclusivas y disfrutar de una experiencia conectada',
        primaryColor: '#F97316',
        secondaryColor: '#EA580C'
      },
      hotel: {
        title: 'Bienvenido a nuestro Hotel',
        subtitle: 'WiFi de alta velocidad para tu comodidad',
        welcomeMessage: 'Conéctate gratis y disfruta de todos nuestros servicios digitales durante tu estancia',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF'
      },
      cafeteria: {
        title: 'Bienvenido a nuestra Cafetería',
        subtitle: 'Trabaja o relájate con nuestro WiFi',
        welcomeMessage: 'Disfruta de nuestro café mientras navegas por internet con conexión rápida y estable',
        primaryColor: '#8B5CF6',
        secondaryColor: '#7C3AED'
      },
      tienda: {
        title: 'Bienvenido a nuestra Tienda',
        subtitle: 'WiFi para una mejor experiencia de compra',
        welcomeMessage: 'Conéctate para recibir notificaciones de ofertas y disfrutar de beneficios exclusivos',
        primaryColor: '#10B981',
        secondaryColor: '#059669'
      },
      oficina: {
        title: 'Bienvenido a nuestras Oficinas',
        subtitle: 'WiFi profesional para tu productividad',
        welcomeMessage: 'Accede a nuestra red WiFi para trabajar de manera eficiente y conectada',
        primaryColor: '#6B7280',
        secondaryColor: '#4B5563'
      },
      gimnasio: {
        title: 'Bienvenido a nuestro Gimnasio',
        subtitle: 'Energía y conexión para tu entrenamiento',
        welcomeMessage: 'Conéctate y accede a tu música, videos y seguimiento de tu progreso mientras entrenas',
        primaryColor: '#EF4444',
        secondaryColor: '#DC2626'
      }
    };

    const suggestion = suggestions[businessType as keyof typeof suggestions] || suggestions.restaurante;

    // Simular delay de la API
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      ...suggestion
    });

  } catch (error) {
    console.error('Error generando sugerencias con IA:', error);
    return NextResponse.json(
      { message: 'Error generando sugerencias' },
      { status: 500 }
    );
  }
}
