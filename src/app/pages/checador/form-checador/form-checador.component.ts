import { Component, OnInit } from '@angular/core';
import { AsistenciaInterface } from '@interfaces/asistencia-interface';
import { AsistenciaService } from '@services/asistencia.service';
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service'; 
import { AlertService } from '@services/alert.service';


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
  cargandoHistorial: boolean = true; // Empieza en true
  
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
      private _toastService: ToastService,
      private _alertService: AlertService
    ) { }

  ngOnInit() {
    // 1. Iniciamos el reloj de inmediato con la hora local
    this.iniciarReloj();

    this.sincronizarReloj();
    this.cargarAsistenciasDia(); // <--- Paso 1
  }

  async cargarAsistenciasDia() {
    this.cargandoHistorial = true; // Por si se llama manualmente después
    // 1. Obtenemos el usuario para saber su ID o tienda si es necesario
    const userStr = await this._preferencesService.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    // 2. Consultamos las asistencias del día actual
    // Nota: El backend debería filtrar por la fecha de hoy
    const datos = {         
      id_tienda: user.id_tienda,
      id_usuario: user.id,
      fecha: 'TODAY',
      activo: 1
    };

    this._asistenciaService.get(datos).subscribe({
      next: (res: any) => {
        if (res.data) {
          console.log(res.data);
          this.mapearRegistros(res.data);
        }
        this.cargandoHistorial = false; // Finaliza la carga
      },
      error: (err) => {
        this.cargandoHistorial = false; // Finaliza la carga
        console.error('Error al cargar historial del día:', err);
      }
    });
  }

  private mapearRegistros(asistencias: any[]) {
    // Reiniciamos el objeto por si acaso
    this.registro = {
      entrada: null,
      comida_inicio: null,
      comida_fin: null,
      salida: null
    };

    if (!asistencias || asistencias.length === 0) return;

    asistencias.forEach(reg => {
      // Usamos el campo 'tipo' que viene en tu JSON (ENTRADA, etc)
      // Lo convertimos a minúsculas para que coincida con tus llaves del objeto registro
      const campo = reg.tipo.toLowerCase();

      // Creamos la fecha combinando el string 'fecha' y 'hora' que vienen en el objeto
      // Ejemplo: "2026-05-02" + "T" + "14:24:15"
      if (this.registro.hasOwnProperty(campo)) {
        this.registro[campo] = new Date(`${reg.fecha}T${reg.hora}`);
      } 
      // Si tu backend usa snake_case para comida inicio/fin, 
      // podrías necesitar un pequeño mapeo extra:
      else if (reg.tipo === 'COMIDA_INICIO') this.registro.comida_inicio = new Date(`${reg.fecha}T${reg.hora}`);
      else if (reg.tipo === 'COMIDA_FIN') this.registro.comida_fin = new Date(`${reg.fecha}T${reg.hora}`);
      else if (reg.tipo === 'SALIDA') this.registro.salida = new Date(`${reg.fecha}T${reg.hora}`);
    });

    console.log('Registros del día procesados:', this.registro);
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
          console.log('Sincronización con servidor OK');
          //this.iniciarReloj();
        }
      },
      error: (err) => {
        console.warn('Usando hora local (Fallo de red):', err);
        // Fallback: Si falla el internet, iniciamos con la hora local para no dejar la pantalla en blanco
        //this.iniciarReloj();
      }
    });    
  }

  iniciarReloj() {
    if (this.timer) clearInterval(this.timer);

    // Ejecutamos una vez de inmediato para evitar el segundo de espera del setInterval
    this.refrescarHora();

    this.timer = setInterval(() => {
      this.refrescarHora();
    }, 1000);
  }

  // Función privada para centralizar el cálculo de la hora
  private refrescarHora() {
    // Si offsetMs es 0 (porque no ha terminado sincronizarReloj), usará la hora local.
    // En cuanto llegue la respuesta del servidor, offsetMs cambiará y el reloj se ajustará solo.
    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    
    this.horaActual = ahoraReal.toLocaleTimeString('es-MX', {
      timeZone: 'America/Mazatlan',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Solo actualizamos la fecha legible la primera vez o si cambia el día
    if (!this.fechaLegible) {
      this.actualizarFechaLegible(ahoraReal);
    }
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
    // 1. VALIDACIÓN PREVENTIVA
    if (this.registro[tipo]) {
        this._toastService.show(
          `Ya has registrado tu ${tipo.replace('_', ' ')} anteriormente.`, 
          'warning', // Color naranja para advertir
          'alert-circle-outline'
        );  
        return;
    }

    // Validación de orden lógico (Ejemplo: No salir si no ha regresado de comer)
    if (tipo === 'salida' && (this.registro.comida_inicio && !this.registro.comida_fin)) {
        this._toastService.show(
          `No puedes finalizar la jornada si aún estás en tiempo de comida.`, 
          'danger', // Color rojo para error de flujo
          'hand-left-outline'
        );  
        return;
    }

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
        if (err.status === 400) {
          // Aquí es donde capturas el "Ya existe un registro"
          this._toastService.show(
            err.error.message, 
            'warning', // Color naranja para advertir
            'alert-circle-outline'
          ); 
        }else{         
          this._toastService.show('Error al conectar con el servidor', 'danger');
        }
      }
    });
    
  }

}
