const format = {
    /**
     * Formatea montos en CLP sin decimales, con puntos de miles.
     * Ej: 65000 -> "65.000"
     */
    monto: (valor) =>
      new Intl.NumberFormat("es-CL", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(valor),
  
    /**
     * Formatea fechas en formato corto legible.
     * Ej: "2025-03-22T18:30:00Z" -> "22-03-2025, 15:30"
     */
    fecha: (fecha) =>
      new Date(fecha).toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
      }),
  
    /**
     * Solo fecha sin hora. Ej: "22/03/2025"
     */
    soloFecha: (fecha) =>
      new Date(fecha).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
  
    /**
     * Solo hora. Ej: "18:45"
     */
    hora: (fecha) =>
      new Date(fecha).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  };
  
  export default format;
  