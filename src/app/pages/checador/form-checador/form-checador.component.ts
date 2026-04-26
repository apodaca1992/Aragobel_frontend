import { Component, OnInit } from '@angular/core';
import { AsistenciaInterface } from '@interfaces/asistencia-interface';
import { AsistenciaService } from '@services/asistencia.service';
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service'; 

@Component({
  selector: 'app-form-checador',
  templateUrl: './form-checador.component.html',
  styleUrls: ['./form-checador.component.scss'],
})
export class FormChecadorComponent  implements OnInit {
  hoy: Date = new Date();
  horaActual: string = '...';
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
      private _asistenciaService: AsistenciaService,
          private _preferencesService: PreferencesService,
          private _toastService: ToastService
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
    // 1. Calculamos la hora real para mostrarla en la UI de inmediato
    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    var tiendaUsuario = '';

    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        tiendaUsuario = user.id_tienda;
    }
    
    // 3. Preparamos el cuerpo del registro
    const datosRegistro = {
      tipo: tipo,           // 'entrada', 'comida_inicio', etc.
      id_tienda: tiendaUsuario,
      ubicacion: {lat: 24.809, lng: 107.394}
    };

    // 4. Llamamos al servicio de asistencia
    this._asistenciaService.post(datosRegistro).subscribe({
      next: (res: any) => {
        // Actualizamos el estado visual del botón
        this.registro[tipo] = ahoraReal;
        
        this._toastService.show(
          `¡${tipo.replace('_', ' ').toUpperCase()} registrado con éxito!`, 
          'success', 
          'time-outline'
        );        
      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        this._toastService.show('Error al conectar con el servidor', 'danger');
      }
    });
    
  }

}
