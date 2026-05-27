import { Component, OnInit } from '@angular/core';
import { AsistenciaInterface } from '@interfaces/asistencia-interface';
import { AsistenciaService } from '@services/asistencia.service';
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service'; 
import { GeolocationService } from '@services/geolocation.service';


@Component({
  selector: 'app-form-checador',
  templateUrl: './form-checador.component.html',
  styleUrls: ['./form-checador.component.scss'],
})
export class FormChecadorComponent  implements OnInit {
  hoy: Date = new Date();
  horaActual: string = '...';
  fechaLegible: string = '';
  bloqueoBoton: boolean = false;

  private timer: any;
  private offsetMs: number = 0;
  cargandoHistorial: boolean = true;
  
  // Objeto de registro
  registro: any = {
    entrada: null,
    comida_inicio: null,
    comida_fin: null,
    salida: null
  };

  private timeZoneActiva: string = 'America/Mazatlan';

  // VARIABLES PARA CÁLCULO
  tipoEsquema: 'FIJO' | 'LIBRE' = 'LIBRE';
  jornadaEf: number = 9.5;    
  comidaMax: number = 1.5;    

  // Horarios exclusivos del esquema FIJO
  horaEntradaFija: string = '';
  horaSalidaFija: string = '';
  horaSalidaComerFija: string = '';
  horaRegresoComerFija: string = '';
  tolerancia_minutos: number = 0;
  

  // VARIABLES DE CONTROL DE VISTA
  salidaTentativa: string = '';
  horasCumplidas: string = '00:00';
  progresoJornada: number = 0;
  horasExtras: string = '00:00';
  tiempoComidaTranscurrido: string = '00:00';
  progresoComida: number = 0;

  constructor(
      private _asistenciaService: AsistenciaService,
      private _preferencesService: PreferencesService,
      private _toastService: ToastService,
      private _geoService: GeolocationService
    ) { }

  async ngOnInit() {
    await this.cargarConfiguracionTienda();
    await this.cargarConfiguracionUsuario();
    this.iniciarReloj();
    this.sincronizarReloj();
    this.cargarAsistenciasDia(); 
  }

  async cargarConfiguracionUsuario() {
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.tipoEsquema = user.tipo_esquema || 'LIBRE';

      if (this.tipoEsquema === 'FIJO') {
        this.horaEntradaFija = user.hora_entrada; 
        this.horaSalidaFija = user.hora_salida;   
        this.horaSalidaComerFija = user.hora_salida_comer;
        this.horaRegresoComerFija = user.hora_regreso_comer;
        this.tolerancia_minutos = user.tolerancia_minutos;

        if (this.horaSalidaComerFija && this.horaRegresoComerFija) {
          const [h1, m1] = this.horaSalidaComerFija.split(':').map(Number);
          const [h2, m2] = this.horaRegresoComerFija.split(':').map(Number);
          this.comidaMax = (h2 + m2/60) - (h1 + m1/60); 
        } else {
          this.comidaMax = 0; 
        }

        if (this.horaEntradaFija && this.horaSalidaFija) {
          const [hEntrada, mEntrada] = this.horaEntradaFija.split(':').map(Number);
          const [hSalida, mSalida] = this.horaSalidaFija.split(':').map(Number);
          
          const horasTotalesTurno = (hSalida + mSalida/60) - (hEntrada + mEntrada/60);
          this.jornadaEf = horasTotalesTurno - this.comidaMax; 
        } else {
          this.jornadaEf = 9.5; 
        }
       
      } else {
        this.jornadaEf = parseFloat(user.jornada_efectiva) || 9.5;
        this.comidaMax = parseFloat(user.tiempo_comida_max) || 1.5;
      }
    }
  }

  async cargarConfiguracionTienda() {
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.timeZoneActiva = user.tienda_activa_config?.timezone || 'America/Mazatlan';
      console.log('Zona horaria activa:', this.timeZoneActiva);
    }
  }

  async cargarAsistenciasDia() {
    this.cargandoHistorial = true; 
    const userStr = await this._preferencesService.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

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
        this.cargandoHistorial = false; 
      },
      error: (err) => {
        this.cargandoHistorial = false; 
        console.error('Error al cargar historial del día:', err);
      }
    });
  }

  private mapearRegistros(asistencias: any[]) {
    this.registro = {
      entrada: null,
      comida_inicio: null,
      comida_fin: null,
      salida: null
    };

    if (!asistencias || asistencias.length === 0 || !asistencias[0].eventos) return;

    const data = asistencias[0];
    const ev = data.eventos;

    if (ev.ENTRADA) {
      this.registro.entrada = new Date(`${data.fecha}T${ev.ENTRADA.hora}`);
    }
    if (ev.COMIDA_INICIO) {
      this.registro.comida_inicio = new Date(`${data.fecha}T${ev.COMIDA_INICIO.hora}`);
    }
    if (ev.COMIDA_FIN) {
      this.registro.comida_fin = new Date(`${data.fecha}T${ev.COMIDA_FIN.hora}`);
    }
    if (ev.SALIDA) {
      this.registro.salida = new Date(`${data.fecha}T${ev.SALIDA.hora}`);
    }

    if (this.registro.entrada) {
      this.calcularMetricas();
    }
    console.log('Registros del día procesados:', this.registro);
  }

  calcularMetricas() {
    if (!this.registro.entrada) return;
    const fechaEntrada = new Date(this.registro.entrada);
    const ahora = new Date(new Date().getTime() + this.offsetMs);

    if (this.tipoEsquema === 'FIJO') {
      // ----------------------------------------------------
      // 🏢 ESQUEMA FIJO (Formato 24 Horas Homologado)
      // ----------------------------------------------------
      if (this.horaSalidaFija) {
        // 🎯 CORRECCIÓN UX: Asignamos directamente la hora fija recortando segundos, sin AM/PM
        this.salidaTentativa = this.horaSalidaFija.slice(0, 5);

        const [h, m] = this.horaSalidaFija.split(':').map(Number);
        const fechaSalidaFija = new Date(fechaEntrada);
        fechaSalidaFija.setHours(h, m, 0, 0);

        let tiempoTotalTrabajoMs = (this.registro.salida ? new Date(this.registro.salida).getTime() : ahora.getTime()) - fechaEntrada.getTime();
        if (tiempoTotalTrabajoMs < 0) tiempoTotalTrabajoMs = 0;

        if (this.registro.comida_inicio) {
          const finComida = this.registro.comida_fin ? new Date(this.registro.comida_fin) : ahora;
          tiempoTotalTrabajoMs -= (finComida.getTime() - new Date(this.registro.comida_inicio).getTime());
        }

        const minutosTotales = Math.floor(tiempoTotalTrabajoMs / (1000 * 60));
        const hrs = Math.floor(minutosTotales / 60);
        const mins = minutosTotales % 60;
        this.horasCumplidas = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        const tiempoTotalTurnoMs = fechaSalidaFija.getTime() - fechaEntrada.getTime();
        if (tiempoTotalTurnoMs > 0) {
          const progreso = tiempoTotalTrabajoMs / tiempoTotalTurnoMs;
          this.progresoJornada = progreso > 1 ? 1 : (progreso < 0 ? 0 : progreso);
        } else {
          this.progresoJornada = 0;
        }

        if (ahora > fechaSalidaFija && fechaEntrada < fechaSalidaFija) {
          const diffExtrasMs = ahora.getTime() - fechaSalidaFija.getTime();
          const minExtras = Math.floor(diffExtrasMs / (1000 * 60));
          this.horasExtras = `${Math.floor(minExtras/60).toString().padStart(2,'0')}:${(minExtras%60).toString().padStart(2,'0')}`;
        } else {
          this.horasExtras = '00:00';
        }
      }

    } else {
      // ----------------------------------------------------
      // ⏳ ESQUEMA LIBRE (Corregido a estricto 24h)
      // ----------------------------------------------------
      const msPorHora = 60 * 60 * 1000;
      let tiempoAdicional = this.jornadaEf; 

      if (this.registro.comida_inicio) {
        if (this.registro.comida_fin) {
          const diffMs = new Date(this.registro.comida_fin).getTime() - new Date(this.registro.comida_inicio).getTime();
          tiempoAdicional += (diffMs / (1000 * 60 * 60));
        } else {
          tiempoAdicional += this.comidaMax;
        }
      }

      const fechaSalidaEstimada = new Date(fechaEntrada.getTime() + (tiempoAdicional * msPorHora));
      
      // 🎯 CORRECCIÓN SENIOR: Extraemos horas militares directamente para romper el filtro AM/PM
      const horas24 = fechaSalidaEstimada.getHours().toString().padStart(2, '0');
      const minutos24 = fechaSalidaEstimada.getMinutes().toString().padStart(2, '0');
      this.salidaTentativa = `${horas24}:${minutos24}`;

      let tiempoTrabajadoMs = ahora.getTime() - fechaEntrada.getTime();
      if (this.registro.comida_inicio) {
        const finComidaRelativo = this.registro.comida_fin ? new Date(this.registro.comida_fin) : ahora;
        tiempoTrabajadoMs -= (finComidaRelativo.getTime() - new Date(this.registro.comida_inicio).getTime());
      }

      const totalMinutosEfectivos = Math.floor(tiempoTrabajadoMs / (1000 * 60));
      const hrs = Math.floor(totalMinutosEfectivos / 60);
      const mins = totalMinutosEfectivos % 60;
      this.horasCumplidas = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

      if (totalMinutosEfectivos > (this.jornadaEf * 60)) {
        const minExtras = totalMinutosEfectivos - (this.jornadaEf * 60);
        this.horasExtras = `${Math.floor(minExtras/60).toString().padStart(2,'0')}:${(minExtras%60).toString().padStart(2,'0')}`;
      } else {
        this.horasExtras = '00:00';
      }

      const progreso = totalMinutosEfectivos / (this.jornadaEf * 60);
      this.progresoJornada = progreso > 1 ? 1 : progreso;
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  sincronizarReloj() {
    const datos = {         
      tz: this.timeZoneActiva
    };
    this._asistenciaService.getTime(datos).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const serverTime = res.data.serverTime; 
          const localTime = new Date().getTime();
          this.offsetMs = serverTime - localTime;
          console.log('Sincronización con servidor OK');
        }
      },
      error: (err) => {
        console.warn('Usando hora local (Fallo de red):', err);
      }
    });    
  }

  iniciarReloj() {
    if (this.timer) clearInterval(this.timer);
    this.refrescarHora();
    this.timer = setInterval(() => {
      this.refrescarHora();
    }, 1000);
  }

  private refrescarHora() {
    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    
    this.horaActual = ahoraReal.toLocaleTimeString('es-MX', {
      timeZone: this.timeZoneActiva,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    if (!this.fechaLegible) {
      this.actualizarFechaLegible(ahoraReal);
    }

    if (this.registro.entrada && !this.registro.salida) {
      this.calcularMetricas();

      if (this.registro.comida_inicio && !this.registro.comida_fin) {
        const inicio = new Date(this.registro.comida_inicio);
        const diffMs = ahoraReal.getTime() - inicio.getTime();
        
        const totalMinutos = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMinutos / 60);
        const mins = totalMinutos % 60;
        
        this.tiempoComidaTranscurrido = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        const limiteMinutos = this.comidaMax * 60;
        this.progresoComida = totalMinutos / limiteMinutos;
        
        if (this.progresoComida > 1) this.progresoComida = 1;
      }
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
    if (this.bloqueoBoton || this.registro[tipo]) return;
    this.bloqueoBoton = true;

    if (tipo === 'entrada' && this.tipoEsquema === 'FIJO' && this.horaEntradaFija) {
      const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
      const [hEntrada, mEntrada] = this.horaEntradaFija.split(':').map(Number);
      
      const limiteEntrada = new Date(ahoraReal);
      limiteEntrada.setHours(hEntrada + 2, mEntrada, 0, 0);

      if (ahoraReal > limiteEntrada) {
        const horaFormateada = this.horaEntradaFija.slice(0, 5); 
        this._toastService.show(
          `Límite de tolerancia excedido. Tu entrada era a las ${horaFormateada} y el límite eran 2 horas tarde.`, 
          'danger', 
          'hand-left-outline'
        );
        this.bloqueoBoton = false;
        return;
      }

      // 2. ⏳ VALIDACIÓN: Anticipación Excesiva (No menor a la tolerancia permitida)
      const limiteEntradaMin = new Date(ahoraReal);
      limiteEntradaMin.setHours(hEntrada, mEntrada, 0, 0);

      if (ahoraReal < limiteEntradaMin) {
        const horaFormateada = this.horaEntradaFija.slice(0, 5);
        this._toastService.show(
          `No puedes iniciar jornada todavía. Tu horario de entrada comienza a las ${horaFormateada}.`, 
          'warning', 
          'time-outline'
        );
        this.bloqueoBoton = false;
        return;
      }
    }

    if (this.registro[tipo]) {
        this._toastService.show(
          `Ya has registrado tu ${tipo.replace('_', ' ')} anteriormente.`, 
          'warning', 
          'alert-circle-outline'
        );  
        return;
    }

    if (tipo === 'salida' && (this.registro.comida_inicio && !this.registro.comida_fin)) {
        this._toastService.show(
          `No puedes finalizar la jornada si aún estás en tiempo de comida.`, 
          'danger', 
          'hand-left-outline'
        );  
        return;
    }

    if (tipo === 'salida' && this.tipoEsquema === 'FIJO' && this.horaSalidaComerFija && (!this.registro.comida_inicio || !this.registro.comida_fin)) {
        this._toastService.show(
          `Operación denegada. Es obligatorio registrar tu salida y regreso de comida antes de finalizar el turno.`, 
          'danger', 
          'restaurant-outline'
        );  
        this.bloqueoBoton = false;
        return;
    }

    const coords = await this._geoService.getPosition();
    if (!coords) {
      this.bloqueoBoton = false;
      return;
    }

    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    var tiendaUsuario = '';
    var nombreUsuario = '';

    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        tiendaUsuario = user.id_tienda;
        nombreUsuario = user.nombre + ' ' + user.apellido_paterno + ' ' + user.apellido_materno;
    }
    
    const datosRegistro = {
      tipo: tipo,           
      id_tienda: tiendaUsuario,
      nombre_usuario: nombreUsuario,
      ubicacion: {
        lat: coords.latitude,
        lng: coords.longitude
      }
    };

    this._asistenciaService.post(datosRegistro).subscribe({
      next: (res: any) => {
        this.registro[tipo] = ahoraReal; 

        if (tipo === 'entrada') {
          this.calcularMetricas();
        }       
        
        this._toastService.show(
          `¡${tipo.replace('_', ' ').toUpperCase()} registrado con éxito!`, 
          'success', 
          'time-outline'
        );      
        this.bloqueoBoton = false; 
      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        this.bloqueoBoton = false; 
      }
    });
  }
}