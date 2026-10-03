// Approved Spanish legal copy (induscrubs-textos-legales.md), copied verbatim.
// Each page is a flat list of blocks; inline bold is { b: '...' }.

export type LegalInline = string | { b: string };

export type LegalBlock =
  | { t: 'h2'; text: string }
  | { t: 'p'; c: LegalInline[] }
  | { t: 'ul' | 'ol'; items: LegalInline[][] };

export interface LegalPageData {
  slug: string;
  title: string;
  updated: string;
  blocks: LegalBlock[];
}

export type LegalSlug = 'terminos' | 'devoluciones' | 'envios' | 'privacidad' | 'cookies' | 'aviso-legal';

export const LEGAL_PAGES: LegalPageData[] = [
  {
    "slug": "terminos",
    "title": "Términos y Condiciones de Venta",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "h2",
        "text": "1. Quiénes somos"
      },
      {
        "t": "p",
        "c": [
          "Induscrubs es la tienda en línea de INDUMEDICA Boutique médica (RUC 1105021024001, razón social ANDREA DANIELA GRANDA CUMBICUS), con local en Antonio José de Sucre y Juan de Salinas, Loja, Ecuador. Somos una empresa ecuatoriana de uniformes médicos, operando desde 2013, y distribuidores autorizados de las marcas que comercializamos."
        ]
      },
      {
        "t": "p",
        "c": [
          "Al realizar una compra en induscrubs.com, el cliente declara haber leído y aceptado estos Términos y Condiciones."
        ]
      },
      {
        "t": "h2",
        "text": "2. Productos"
      },
      {
        "t": "p",
        "c": [
          "Vendemos uniformes médicos (scrubs, filipinas, pantalones, batas, chaquetas, gorros, cofias y línea estética) de distintas marcas. Las fotografías, colores y descripciones son referenciales; pueden existir ligeras variaciones de tono según la pantalla del dispositivo. Las tallas se rigen por la tabla de tallas en centímetros publicada en el sitio (XXS a 3XL); es responsabilidad del cliente verificarla antes de comprar."
        ]
      },
      {
        "t": "h2",
        "text": "3. Precios"
      },
      {
        "t": "p",
        "c": [
          "Los precios se expresan en dólares de los Estados Unidos de América (USD) e incluyen los impuestos de ley, salvo que se indique lo contrario. Induscrubs puede modificar sus precios en cualquier momento; el precio aplicable es el vigente al momento de confirmar el pedido."
        ]
      },
      {
        "t": "h2",
        "text": "4. Proceso de compra"
      },
      {
        "t": "ol",
        "items": [
          [
            "El cliente agrega productos al carrito y selecciona talla y color."
          ],
          [
            "En el Checkout elige el método de pago y registra sus datos de contacto y entrega."
          ],
          [
            "Realiza el pago y envía el comprobante (ver sección 5)."
          ],
          [
            "Induscrubs verifica el pago y confirma el pedido."
          ]
        ]
      },
      {
        "t": "p",
        "c": [
          "Un pedido se considera ",
          {
            "b": "confirmado únicamente cuando el pago ha sido verificado"
          },
          " por Induscrubs. Hasta entonces, el pedido queda en estado \"Pendiente de verificación\"."
        ]
      },
      {
        "t": "h2",
        "text": "5. Formas de pago"
      },
      {
        "t": "p",
        "c": [
          {
            "b": "Transferencia o depósito bancario."
          },
          " El cliente realiza la transferencia por el monto exacto del pedido a una de las cuentas bancarias mostradas en el Checkout, y envía el comprobante por WhatsApp al 0988223950. El cliente debe verificar que los datos de la cuenta (banco, número, titular) coincidan con los publicados en el Checkout. Induscrubs no se responsabiliza por transferencias hechas a cuentas distintas de las publicadas oficialmente en el sitio."
        ]
      },
      {
        "t": "p",
        "c": [
          {
            "b": "PayPhone."
          },
          " Cuando este método esté habilitado, tendrá un recargo del 5% sobre el total, que se mostrará en el resumen del pedido antes de pagar."
        ]
      },
      {
        "t": "p",
        "c": [
          "Induscrubs no solicita ni almacena datos de tarjetas en este sitio."
        ]
      },
      {
        "t": "h2",
        "text": "6. Disponibilidad de stock"
      },
      {
        "t": "p",
        "c": [
          "Los pedidos están sujetos a disponibilidad. Si, tras verificar el pago, un producto no estuviera disponible, Induscrubs contactará al cliente para ofrecerle un cambio por otro producto o talla, o la devolución del valor pagado por transferencia."
        ]
      },
      {
        "t": "h2",
        "text": "7. Envíos"
      },
      {
        "t": "p",
        "c": [
          "Las condiciones de envío y entrega constan en la ",
          {
            "b": "Política de Envíos y Entrega"
          },
          "."
        ]
      },
      {
        "t": "h2",
        "text": "8. Cambios, devoluciones y reembolsos"
      },
      {
        "t": "p",
        "c": [
          "Constan en la ",
          {
            "b": "Política de Devoluciones y Reembolsos"
          },
          ", que forma parte de estos Términos."
        ]
      },
      {
        "t": "h2",
        "text": "9. Derechos del consumidor"
      },
      {
        "t": "p",
        "c": [
          "Nada de lo dispuesto en estos Términos limita los derechos que la Ley Orgánica de Defensa del Consumidor y su Reglamento reconocen al consumidor."
        ]
      },
      {
        "t": "h2",
        "text": "10. Propiedad intelectual"
      },
      {
        "t": "p",
        "c": [
          "Las marcas, logotipos e imágenes de productos pertenecen a sus respectivos titulares. El contenido propio del sitio (textos, diseño, logotipo de Induscrubs) no puede reproducirse sin autorización escrita. Ver ",
          {
            "b": "Aviso Legal"
          },
          "."
        ]
      },
      {
        "t": "h2",
        "text": "11. Uso del sitio"
      },
      {
        "t": "p",
        "c": [
          "El cliente se compromete a proporcionar información veraz y a no usar el sitio con fines ilícitos o fraudulentos. Induscrubs puede cancelar pedidos en los que detecte datos falsos o intentos de fraude."
        ]
      },
      {
        "t": "h2",
        "text": "12. Modificaciones"
      },
      {
        "t": "p",
        "c": [
          "Induscrubs puede actualizar estos Términos. La versión vigente es la publicada en el sitio al momento de la compra."
        ]
      },
      {
        "t": "h2",
        "text": "13. Ley aplicable y jurisdicción"
      },
      {
        "t": "p",
        "c": [
          "Estos Términos se rigen por las leyes de la República del Ecuador. Cualquier controversia se someterá a los jueces competentes de la ciudad de Loja, sin perjuicio de los derechos del consumidor ante las autoridades competentes."
        ]
      },
      {
        "t": "h2",
        "text": "14. Contacto"
      },
      {
        "t": "p",
        "c": [
          "compras@induscrubs.com · WhatsApp 0988223950 · Lunes a Viernes 10:00 – 19:00, Sábado 10:00 – 15:30."
        ]
      }
    ]
  },
  {
    "slug": "devoluciones",
    "title": "Política de Devoluciones y Reembolsos",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "p",
        "c": [
          "En Induscrubs queremos que quedes conforme con tu compra. Esta política explica cómo funcionan los cambios."
        ]
      },
      {
        "t": "h2",
        "text": "1. Solo cambios, no reembolsos"
      },
      {
        "t": "p",
        "c": [
          "Aceptamos ",
          {
            "b": "cambios"
          },
          " de producto. ",
          {
            "b": "No realizamos reembolsos de dinero"
          },
          " por arrepentimiento, talla, color o preferencia personal. Esto es sin perjuicio de los derechos que la ley reconoce al consumidor (ver sección 6)."
        ]
      },
      {
        "t": "h2",
        "text": "2. Plazo"
      },
      {
        "t": "p",
        "c": [
          "Tienes ",
          {
            "b": "2 días"
          },
          " para solicitar el cambio, contados desde el día en que ",
          {
            "b": "recibes"
          },
          " el producto. Pasado ese plazo no podremos aceptar la solicitud."
        ]
      },
      {
        "t": "h2",
        "text": "3. Condiciones del producto"
      },
      {
        "t": "p",
        "c": [
          "Para ser aceptado, el producto debe estar:"
        ]
      },
      {
        "t": "ul",
        "items": [
          [
            "En buen estado, sin uso y sin lavar."
          ],
          [
            "Sin daños, manchas, olores ni modificaciones (por ejemplo, dobladillos o bordados)."
          ],
          [
            "Con sus etiquetas y empaque originales."
          ]
        ]
      },
      {
        "t": "p",
        "c": [
          "Induscrubs revisará el producto al recibirlo y podrá rechazar el cambio si no cumple estas condiciones."
        ]
      },
      {
        "t": "h2",
        "text": "4. Productos que no tienen cambio"
      },
      {
        "t": "p",
        "c": [
          "Por razones de higiene, ",
          {
            "b": "no tienen cambio"
          },
          " los gorros quirúrgicos, las cofias y los artículos similares de uso personal."
        ]
      },
      {
        "t": "h2",
        "text": "5. Cómo solicitar un cambio"
      },
      {
        "t": "ol",
        "items": [
          [
            "Escríbenos dentro del plazo por WhatsApp al 0988223950 o a compras@induscrubs.com, indicando tu número de pedido, el producto y el motivo del cambio."
          ],
          [
            "Te confirmaremos si procede y cómo enviarlo."
          ],
          [
            "Una vez recibido y revisado el producto, te enviamos el nuevo, sujeto a disponibilidad. Si hay diferencia de precio, se ajusta."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "6. Costos de envío del cambio"
      },
      {
        "t": "ul",
        "items": [
          [
            {
              "b": "Clientes en Loja:"
            },
            " el cambio se coordina por WhatsApp, sin costo de envío, en línea con nuestro envío gratis en la ciudad."
          ],
          [
            {
              "b": "Clientes fuera de Loja:"
            },
            " el cliente paga ",
            {
              "b": "el envío de regreso"
            },
            " del producto original ",
            {
              "b": "y el envío del producto nuevo"
            },
            "."
          ],
          [
            {
              "b": "Producto defectuoso o error de Induscrubs"
            },
            " (producto distinto al pedido, talla o color equivocado, falla de fábrica): el costo de envío del cambio lo asume Induscrubs. Debes reportarlo dentro del mismo plazo de 2 días, con fotos del producto."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "7. Derechos del consumidor"
      },
      {
        "t": "p",
        "c": [
          "Esta política no limita los derechos que la Ley Orgánica de Defensa del Consumidor reconoce al consumidor frente a productos defectuosos o que no correspondan a lo ofrecido."
        ]
      },
      {
        "t": "h2",
        "text": "8. Contacto"
      },
      {
        "t": "p",
        "c": [
          "compras@induscrubs.com · WhatsApp 0988223950."
        ]
      }
    ]
  },
  {
    "slug": "envios",
    "title": "Políticas de Envío y Entrega",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "h2",
        "text": "1. Cobertura"
      },
      {
        "t": "p",
        "c": [
          "Realizamos entregas en Loja y en otras ciudades del Ecuador mediante servicios de courier y logística."
        ]
      },
      {
        "t": "h2",
        "text": "2. Envío en Loja"
      },
      {
        "t": "p",
        "c": [
          {
            "b": "¡Envíos gratis en todo Loja!"
          },
          " La entrega se coordina por WhatsApp una vez verificado tu pago."
        ]
      },
      {
        "t": "h2",
        "text": "3. Envíos fuera de Loja"
      },
      {
        "t": "p",
        "c": [
          "Los pedidos a otras ciudades se despachan mediante servicios de courier y logística. El costo del envío depende del destino y del peso del paquete, y es asumido por el cliente. Te informaremos el valor antes de despachar tu pedido."
        ]
      },
      {
        "t": "h2",
        "text": "4. Cuándo se despacha tu pedido"
      },
      {
        "t": "p",
        "c": [
          "Despachamos tu pedido ",
          {
            "b": "después de verificar el pago"
          },
          ". Una vez despachado, te compartiremos la información de seguimiento si el servicio la proporciona. Los plazos de entrega son estimados y pueden variar según la ciudad, la disponibilidad del producto y la operación del courier; Induscrubs no responde por retrasos atribuibles a la empresa de transporte o a fuerza mayor."
        ]
      },
      {
        "t": "h2",
        "text": "5. Datos de entrega"
      },
      {
        "t": "p",
        "c": [
          "El cliente debe proporcionar una dirección completa y un teléfono de contacto correctos. Si el paquete no puede entregarse por datos incorrectos o ausencia reiterada del destinatario, el costo de un nuevo intento de entrega corre por cuenta del cliente."
        ]
      },
      {
        "t": "h2",
        "text": "6. Revisión al recibir"
      },
      {
        "t": "p",
        "c": [
          "Te recomendamos revisar el paquete al recibirlo. Si llega dañado o con productos distintos a los pedidos, escríbenos de inmediato (ver ",
          {
            "b": "Política de Devoluciones y Reembolsos"
          },
          ")."
        ]
      },
      {
        "t": "h2",
        "text": "7. Contacto"
      },
      {
        "t": "p",
        "c": [
          "compras@induscrubs.com · WhatsApp 0988223950."
        ]
      }
    ]
  },
  {
    "slug": "privacidad",
    "title": "Política de Privacidad",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "h2",
        "text": "1. Responsable del tratamiento"
      },
      {
        "t": "p",
        "c": [
          "INDUMEDICA Boutique médica (Induscrubs), RUC 1105021024001, razón social ANDREA DANIELA GRANDA CUMBICUS, domicilio en Antonio José de Sucre y Juan de Salinas, Loja, Ecuador. Contacto: compras@induscrubs.com."
        ]
      },
      {
        "t": "p",
        "c": [
          "Tratamos tus datos conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador."
        ]
      },
      {
        "t": "h2",
        "text": "2. Datos que recopilamos"
      },
      {
        "t": "ul",
        "items": [
          [
            {
              "b": "Datos de pedido:"
            },
            " nombre, teléfono, correo electrónico, dirección de entrega y detalle de los productos comprados."
          ],
          [
            {
              "b": "Datos de pago:"
            },
            " el comprobante de transferencia que nos envías por WhatsApp. No almacenamos datos de tarjetas."
          ],
          [
            {
              "b": "Datos de newsletter:"
            },
            " tu correo electrónico, si te suscribes."
          ],
          [
            {
              "b": "Datos técnicos:"
            },
            " información básica de navegación necesaria para el funcionamiento del sitio (ver ",
            {
              "b": "Política de Cookies"
            },
            ")."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "3. Para qué usamos tus datos"
      },
      {
        "t": "ul",
        "items": [
          [
            "Procesar, verificar y entregar tus pedidos."
          ],
          [
            "Contactarte por WhatsApp o correo para confirmar tu pedido, coordinar la entrega o gestionar cambios."
          ],
          [
            "Cumplir obligaciones legales y tributarias."
          ],
          [
            "Enviarte novedades y promociones, ",
            {
              "b": "solo si te suscribes"
            },
            " al newsletter. Puedes darte de baja en cualquier momento desde el enlace incluido en cada correo."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "4. Con quién compartimos tus datos"
      },
      {
        "t": "p",
        "c": [
          "No vendemos tus datos. Los compartimos únicamente con proveedores que necesitamos para operar:"
        ]
      },
      {
        "t": "ul",
        "items": [
          [
            "Empresas de courier y logística, para entregar tu pedido."
          ],
          [
            "Proveedores tecnológicos de alojamiento y base de datos del sitio."
          ],
          [
            "Proveedor de envío de correos del newsletter (Brevo)."
          ],
          [
            "WhatsApp, cuando te comunicas con nosotros por ese medio."
          ],
          [
            "Autoridades, cuando la ley lo exija."
          ]
        ]
      },
      {
        "t": "p",
        "c": [
          "Algunos de estos proveedores pueden almacenar datos fuera del Ecuador, aplicando medidas de seguridad adecuadas."
        ]
      },
      {
        "t": "h2",
        "text": "5. Conservación"
      },
      {
        "t": "p",
        "c": [
          "Conservamos tus datos mientras sean necesarios para las finalidades indicadas y durante los plazos exigidos por la normativa tributaria y comercial. Los datos del newsletter se conservan hasta que canceles tu suscripción."
        ]
      },
      {
        "t": "h2",
        "text": "6. Seguridad"
      },
      {
        "t": "p",
        "c": [
          "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra acceso no autorizado, pérdida o alteración."
        ]
      },
      {
        "t": "h2",
        "text": "7. Tus derechos"
      },
      {
        "t": "p",
        "c": [
          "Puedes ejercer tus derechos de acceso, rectificación, actualización, eliminación, oposición, portabilidad y suspensión del tratamiento, escribiendo a ",
          {
            "b": "compras@induscrubs.com"
          },
          ". Responderemos dentro de los plazos que establece la ley. Si consideras que tus derechos no fueron atendidos, puedes acudir a la Superintendencia de Protección de Datos Personales."
        ]
      },
      {
        "t": "h2",
        "text": "8. Menores de edad"
      },
      {
        "t": "p",
        "c": [
          "El sitio no está dirigido a menores de 18 años y no recopilamos sus datos a sabiendas."
        ]
      },
      {
        "t": "h2",
        "text": "9. Cambios a esta política"
      },
      {
        "t": "p",
        "c": [
          "Podemos actualizar esta política; publicaremos la versión vigente con su fecha."
        ]
      }
    ]
  },
  {
    "slug": "cookies",
    "title": "Política de Cookies",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "h2",
        "text": "1. Qué son"
      },
      {
        "t": "p",
        "c": [
          "Las cookies y tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos que se guardan en tu dispositivo cuando visitas un sitio web."
        ]
      },
      {
        "t": "h2",
        "text": "2. Qué usamos"
      },
      {
        "t": "ul",
        "items": [
          [
            {
              "b": "Técnicas o necesarias:"
            },
            " permiten que el sitio funcione, por ejemplo recordar los productos de tu carrito mientras navegas. No pueden desactivarse en nuestros sistemas."
          ],
          [
            {
              "b": "De análisis o publicidad:"
            },
            " solo las usaremos si las activamos en el futuro y, en ese caso, pediremos tu consentimiento antes y actualizaremos esta política."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "3. Servicios de terceros"
      },
      {
        "t": "p",
        "c": [
          "Si usas enlaces a servicios externos desde el sitio (como WhatsApp o Instagram), esas plataformas pueden aplicar sus propias cookies bajo sus políticas."
        ]
      },
      {
        "t": "h2",
        "text": "4. Cómo controlarlas"
      },
      {
        "t": "p",
        "c": [
          "Puedes bloquear o eliminar cookies desde la configuración de tu navegador. Si bloqueas las técnicas, partes del sitio, como el carrito, podrían no funcionar correctamente."
        ]
      },
      {
        "t": "h2",
        "text": "5. Contacto"
      },
      {
        "t": "p",
        "c": [
          "compras@induscrubs.com."
        ]
      }
    ]
  },
  {
    "slug": "aviso-legal",
    "title": "Aviso Legal",
    "updated": "Última actualización: 2 de octubre de 2026",
    "blocks": [
      {
        "t": "h2",
        "text": "1. Titular del sitio"
      },
      {
        "t": "ul",
        "items": [
          [
            {
              "b": "Nombre comercial:"
            },
            " Induscrubs, INDUMEDICA Boutique médica"
          ],
          [
            {
              "b": "Razón social:"
            },
            " ANDREA DANIELA GRANDA CUMBICUS"
          ],
          [
            {
              "b": "RUC:"
            },
            " 1105021024001"
          ],
          [
            {
              "b": "Domicilio:"
            },
            " Antonio José de Sucre y Juan de Salinas, Loja, Ecuador"
          ],
          [
            {
              "b": "Correo:"
            },
            " compras@induscrubs.com"
          ],
          [
            {
              "b": "Teléfono / WhatsApp:"
            },
            " 0988223950"
          ],
          [
            {
              "b": "Horario de atención:"
            },
            " Lunes a Viernes 10:00 – 19:00, Sábado 10:00 – 15:30. Domingo cerrado."
          ]
        ]
      },
      {
        "t": "h2",
        "text": "2. Objeto"
      },
      {
        "t": "p",
        "c": [
          "Este sitio permite conocer y comprar en línea los productos de Induscrubs. El uso del sitio implica la aceptación de este Aviso Legal."
        ]
      },
      {
        "t": "h2",
        "text": "3. Distribuidor autorizado y marcas de terceros"
      },
      {
        "t": "p",
        "c": [
          "Induscrubs es ",
          {
            "b": "distribuidor autorizado"
          },
          " de las marcas de uniformes médicos que comercializa. Los nombres, marcas, logotipos e imágenes de producto de esas marcas son propiedad de sus respectivos titulares y se muestran con el único fin de identificar y ofrecer los productos. Su presencia no implica que Induscrubs sea titular de dichas marcas."
        ]
      },
      {
        "t": "h2",
        "text": "4. Propiedad intelectual de Induscrubs"
      },
      {
        "t": "p",
        "c": [
          "El diseño del sitio, los textos propios, el nombre y el logotipo de Induscrubs están protegidos por la normativa de propiedad intelectual. Queda prohibida su reproducción o uso comercial sin autorización escrita del titular."
        ]
      },
      {
        "t": "h2",
        "text": "5. Responsabilidad"
      },
      {
        "t": "p",
        "c": [
          "Procuramos que la información del sitio sea exacta y esté actualizada, pero puede contener errores u omisiones involuntarias (de precio, stock o descripción). Induscrubs podrá corregirlos. El sitio puede contener enlaces a páginas de terceros sobre las que no tenemos control."
        ]
      },
      {
        "t": "h2",
        "text": "6. Normativa aplicable"
      },
      {
        "t": "p",
        "c": [
          "Este sitio se rige por la legislación ecuatoriana, en especial la Ley Orgánica de Defensa del Consumidor, la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos y la Ley Orgánica de Protección de Datos Personales."
        ]
      },
      {
        "t": "h2",
        "text": "7. Jurisdicción"
      },
      {
        "t": "p",
        "c": [
          "Para cualquier controversia, las partes se someten a los jueces competentes de la ciudad de Loja, sin perjuicio de los derechos del consumidor."
        ]
      }
    ]
  }
];
