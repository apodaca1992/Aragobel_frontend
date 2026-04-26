import { Component, OnInit } from '@angular/core';
import { AsistenciaInterface } from '@interfaces/asistencia-interface';
import { AsistenciaService } from '@services/asistencia.service';

@Component({
  selector: 'app-form-checador',
  templateUrl: './form-checador.component.html',
  styleUrls: ['./form-checador.component.scss'],
})
export class FormChecadorComponent  implements OnInit {
  hoy: Date = new Date();
  horaActual: string = 'Cargando...';
  // Cambia tu variable hoy por esta lógica
  fechaLegible: string = '';

  private timer: any;
  private offsetMs: number = 0;
  
  // Objeto de registro
  registro: any = {
    entrada: null, //new Date()
    comida_inicio: null,
    comida_fin: null,
    salida: null
  };

  constructor(
      private _asistenciaService: AsistenciaService
    ) { }

  ngOnInit() {
    this.sincronizarReloj();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  sincronizarReloj() {
    this._asistenciaService.getTime().subscribe({
      next: (res: any) => {
        // Validamos que la respuesta sea exitosa según tu JSON
        if (res.success && res.data) {
          const serverTime = res.data.serverTime; // Accedemos a data.serverTime
          const localTime = new Date().getTime();

          // Calculamos el desfase real
          this.offsetMs = serverTime - localTime;

          console.log('Sincronización Exitosa con Aragobel (Mazatlán Time)');
          this.iniciarReloj();
        }
      },
      error: (err) => {
        console.error('Error al sincronizar hora:', err);
        // Fallback: Si falla el internet, iniciamos con la hora local para no dejar la pantalla en blanco
        this.iniciarReloj();
      }
    });    
  }

  iniciarReloj() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      // Calculamos la hora real sumando el desfase a la hora actual del dispositivo
      const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
      
      this.horaActual = ahoraReal.toLocaleTimeString('es-MX', {
        timeZone: 'America/Mazatlan',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      if (!this.fechaLegible) {
        this.actualizarFechaLegible(ahoraReal);
      }
    }, 1000);
  }

  actualizarFechaLegible(fecha: Date) {
    let str = fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    str = str.replace(/ de /gi, ' de ');
    this.fechaLegible = str.charAt(0).toUpperCase() + str.slice(1);
  }

  get estadoActual() {
    if (this.registro.salida) return { texto: 'Jornada Finalizada', color: 'dark' };
    if (this.registro.comida_inicio && !this.registro.comida_fin) return { texto: 'En tiempo de comida', color: 'warning' };
    if (this.registro.entrada) return { texto: 'Laborando', color: 'success' };
    return { texto: 'Sin iniciar turno', color: 'medium' };
  }

  async registrar(tipo: string) {
    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    this.registro[tipo] = ahoraReal;

    console.log(`Marcaje ${tipo} guardado a las:`, ahoraReal.toISOString());
    
    // Aquí es donde harías el this._service.post(...)

    // TODO: Enviar a tu API de Node.js
    // this._asistenciaService.guardarMarcaje({ tipo, hora: ahora, id_usuario: ... });
  }

}
