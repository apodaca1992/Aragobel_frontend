import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-checador',
  templateUrl: './form-checador.component.html',
  styleUrls: ['./form-checador.component.scss'],
})
export class FormChecadorComponent  implements OnInit {
  hoy: Date = new Date();
  horaActual: string = '';
  // Cambia tu variable hoy por esta lógica
  fechaLegible: string = '';
  
  // Objeto de registro
  registro: any = {
    entrada: null, //new Date()
    comida_inicio: null,
    comida_fin: null,
    salida: null
  };

  constructor() { }

  ngOnInit() {
    this.iniciarReloj();
    // Generamos la fecha en español de México
    const fecha = new Date();
    // En el ngOnInit después de generar la fecha
    this.fechaLegible = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Forzar minúsculas en los conectores para que se vea bien pro
    this.fechaLegible = this.fechaLegible.replace(/ De /g, ' de ');
    this.fechaLegible = this.fechaLegible.charAt(0).toUpperCase() + this.fechaLegible.slice(1);

    // Aquí deberías cargar los registros guardados del día desde tu DB o Storage

  }

  iniciarReloj() {
    setInterval(() => {
      // Forzamos el formato de 24h y la zona horaria de Sinaloa para el reloj visual
      this.horaActual = new Date().toLocaleTimeString('es-MX', {
        timeZone: 'America/Mazatlan',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }, 1000);
  }

  get estadoActual() {
    if (this.registro.salida) return { texto: 'Jornada Finalizada', color: 'dark' };
    if (this.registro.comida_inicio && !this.registro.comida_fin) return { texto: 'En tiempo de comida', color: 'warning' };
    if (this.registro.entrada) return { texto: 'Laborando', color: 'success' };
    return { texto: 'Sin iniciar turno', color: 'medium' };
  }

  async registrar(tipo: string) {
    // Capturamos la hora exacta en que se hace click
    const ahora = new Date();

    // Actualizamos el objeto local para que el HTML reaccione
    this.registro[tipo] = ahora;

    console.log(`Marcaje de ${tipo} en Sinaloa:`, ahora);

    // TODO: Enviar a tu API de Node.js
    // this._asistenciaService.guardarMarcaje({ tipo, hora: ahora, id_usuario: ... });
  }

}
