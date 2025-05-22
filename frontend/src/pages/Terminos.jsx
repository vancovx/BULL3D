import React from "react";
import './Terminos.css';

const TermsAndConditions = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Términos y Condiciones</h1>

      <p className="mb-4">
        Al acceder y utilizar este sitio web, aceptas estar sujeto a los
        siguientes Términos y Condiciones. Si no estás de acuerdo con alguno de
        estos términos, por favor, no utilices este sitio.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Uso de los Assets</h2>
      <p className="mb-4">
        Todos los archivos, recursos gráficos y digitales ("assets") disponibles
        en esta plataforma son propiedad de sus respectivos creadores o de esta
        página. Están licenciados para su uso personal o comercial según se
        especifique en cada recurso individual.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Restricciones</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>No puedes revender, redistribuir o sublicenciar los assets.</li>
        <li>No puedes reclamar la autoría de los assets como propios.</li>
        <li>No puedes usar los assets para propósitos ilegales o dañinos.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Propiedad Intelectual</h2>
      <p className="mb-4">
        Todos los derechos de propiedad intelectual sobre los assets y el
        contenido del sitio pertenecen a [Nombre de la Empresa o Autor], a menos
        que se indique lo contrario. Su uso no implica la transferencia de
        ningún derecho de propiedad intelectual.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Exención de Responsabilidad</h2>
      <p className="mb-4">
        Este sitio no garantiza que los assets estén libres de errores, virus o
        sean adecuados para cualquier propósito específico. El uso de los mismos
        corre por tu cuenta y riesgo.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Modificaciones</h2>
      <p className="mb-4">
        Nos reservamos el derecho de modificar estos Términos y Condiciones en
        cualquier momento. Las versiones actualizadas estarán disponibles en
        esta página.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Contacto</h2>
      <p className="mb-4">
        Si tienes preguntas o inquietudes sobre estos términos, contáctanos en:{" "}
        <a href="mailto:soporte@tupagina.com" className="text-blue-600 underline">
          soporte@tupagina.com
        </a>
      </p>
    </div>
  );
};

export default TermsAndConditions;
