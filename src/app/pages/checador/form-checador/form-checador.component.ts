import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsistenciaService } from '@services/asistencia.service';
import { PreferencesService } from '@services/preference.service';
import { ToastService } from '@services/toast.service'; 
import { GeolocationService } from '@services/geolocation.service';

@Component({
  selector: 'app-form-checador',
  templateUrl: './form-checador.component.html',
  styleUrls: ['./form-checador.component.scss'],
})
export class FormChecadorComponent implements OnInit, OnDestroy {
  hoy: Date = new Date();
  horaActual: string = '...';
  fechaLegible: string = '';
  bloqueoBoton: boolean = false;

  private timer: any;
  private offsetMs: number = 0;
  cargandoHistorial: boolean = true;
  
  // Objeto de registro normalizado para la UI primaria
  registro: any = {
    entrada: null,
    salida: null
  };

  // Arreglo dinámico para manejar múltiples comidas en la vista
  listaComidasUI: any[] = [];

  // Guardamos la configuración de comidas activas de la jornada actual
  configComidasJornada: any[] = [];
  private nodoComidasBackend: any = null;

  private timeZoneActiva: string = 'America/Mazatlan';

  // VARIABLES PARA CÁLCULO
  tipoEsquema: 'FIJO' | 'LIBRE' = 'LIBRE';
  jornadaEf: number = 15; 
  comidaMax: number = 3;  

  // Horarios de referencia mapeados desde la jornada actual del backend
  horaEntradaFija: string = '';
  horaSalidaFija: string = '';
  tolerancia_minutos: number = 0;

  // VARIABLES DE CONTROL DE VISTA
  salidaTentativa: string = '';
  horasCumplidas: string = '00:00';
  progresoJornada: number = 0;
  horasExtras: string = '00:00';
  
  // Variables para la comida en progreso (Card de barra de progreso)
  comidaActivaEnProgreso: any = null;
  tiempoComidaTranscurrido: string = '00:00';
  progresoComida: number = 0;

  // Almacenes de objetos fecha nativos para cálculos exactos de turnos FIJOS
  public entradaFijaDate: Date | null = null;
  public salidaFijaDate: Date | null = null;

  constructor(
    private _asistenciaService: AsistenciaService,
    private _preferencesService: PreferencesService,
    private _toastService: ToastService,
    private _geoService: GeolocationService
  ) { }

  async ngOnInit() {
    await this.cargarConfiguracionTienda();
    this.iniciarReloj();
    this.sincronizarReloj();
    this.cargarAsistenciasDia(); 
  }

  async cargarConfiguracionTienda() {
    const userStr = await this._preferencesService.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.timeZoneActiva = user.tienda_activa_config?.timezone || 'America/Mazatlan';
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
      status_jornada: 'ACTIVA',//fecha: 'TODAY',
      activo: 1
    };

    this._asistenciaService.get(datos).subscribe({
      next: async (res: any) => { 
        const jornada = res?.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;

        if (jornada && (jornada.id || jornada.id_usuario)) {
          const idDocumento = jornada.id;

          if (idDocumento) {
            if (jornada.status_jornada === 'ACTIVA') {
              const idActual = await this._preferencesService.getItem('id_jornada_activa');
              if (!idActual) {
                await this._preferencesService.setItem('id_jornada_activa', idDocumento);
                console.log('🔄 ID de jornada recuperado:', idDocumento);
              }
            } else {
              await this._preferencesService.removeItem('id_jornada_activa');
            }
          }

          this.mapearRegistros(jornada);
        } else {
          // ===================================================================
          // TRATAMIENTO PARA CUANDO NO HAY JORNADA EN EL SERVIDOR (SIN ENTRADA)
          // ===================================================================
          await this._preferencesService.removeItem('id_jornada_activa');
          
          // Rescatamos los datos del contrato/perfil directo del usuario logueado
          this.tipoEsquema = user.tipo_esquema || 'FIJO'; 
          
          if (this.tipoEsquema === 'FIJO') {
            // Buscamos sus valores predeterminados asignados
            this.horaEntradaFija = user.hora_entrada || '21:00'; 
            this.horaSalidaFija = user.hora_salida || '05:30';

            // Armamos instancias de objetos Date síncronos para que el HTML renderice el día de inmediato
            const hoyEntrada = new Date();
            const [hE, mE] = this.horaEntradaFija.split(':');
            hoyEntrada.setHours(parseInt(hE), parseInt(mE), 0, 0);
            this.entradaFijaDate = hoyEntrada;

            const hoySalida = new Date();
            const [hS, mS] = this.horaSalidaFija.split(':');
            hoySalida.setHours(parseInt(hS), parseInt(mS), 0, 0);
            
            // Verificación del cruce de medianoche en turno nocturno estándar
            if (hoySalida.getTime() < hoyEntrada.getTime()) {
              hoySalida.setDate(hoySalida.getDate() + 1);
            }
            this.salidaFijaDate = hoySalida;
          }

          this.registro = { entrada: null, salida: null };
          this.listaComidasUI = [];
          this.cargandoHistorial = false;
          // ===================================================================
        }
      },
      error: (err) => {
        this.cargandoHistorial = false; 
        console.error('Error al cargar historial:', err);
      }
    });
  }

  private mapearRegistros(data: any) {
    this.registro = { entrada: null, salida: null };
    this.listaComidasUI = [];
    
    this.tipoEsquema = data.tipo_esquema || 'LIBRE';
    this.tolerancia_minutos = data.tolerancia_minutos || 0;
    this.configComidasJornada = data.config_comidas || [];
    this.jornadaEf = data.jornada_efectiva !== undefined ? data.jornada_efectiva : 15;

    // --- CORRECCIÓN CRÍTICA PARA TURNOS CRUZADOS (MEDIANOCHE) ---
    if (data.hora_entrada) {
      this.entradaFijaDate = new Date(data.hora_entrada);
      this.horaEntradaFija = this.entradaFijaDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    if (data.hora_salida && this.entradaFijaDate) {
      this.salidaFijaDate = new Date(data.hora_salida);
      
      // Si la hora de salida es menor que la de entrada (ej: 05:30 < 21:00), avanza un día automáticamente
      if (this.salidaFijaDate.getTime() < this.entradaFijaDate.getTime()) {
        this.salidaFijaDate.setDate(this.salidaFijaDate.getDate() + 1);
        console.log('🌙 Turno nocturno detectado. Salida ajustada al día siguiente:', this.salidaFijaDate);
      }
      
      this.horaSalidaFija = this.salidaFijaDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    // -------------------------------------------------------------

    const ev = data.eventos;
    this.nodoComidasBackend = ev?.comidas || null;

    const parseTimestamp = (nodo: any) => {
      if (!nodo) return null;
      if (nodo.timestamp && nodo.timestamp._seconds) return new Date(nodo.timestamp._seconds * 1000);
      if (nodo.timestamp) return new Date(nodo.timestamp);
      return null;
    };

    if (ev) {
      if (ev.ENTRADA) this.registro.entrada = parseTimestamp(ev.ENTRADA);
      if (ev.SALIDA) this.registro.salida = parseTimestamp(ev.SALIDA);
    }

    if (!this.registro.entrada && data.evento_registrado && data.evento_registrado.tipo === 'ENTRADA') {
      this.registro.entrada = new Date(data.evento_registrado.timestamp);
    }

    // Construcción dinámica de las comidas
    let minutosComidaMax = 0;
    this.configComidasJornada.forEach((config, index) => {
      let limiteHoras = 1.5; 
      
      let salidaComerDate = config.hora_salida_comer ? new Date(config.hora_salida_comer) : null;
      let regresoComerDate = config.hora_regreso_comer ? new Date(config.hora_regreso_comer) : null;

      // Ajuste de desfase para los horarios fijos de comida si cruzan la medianoche respecto a la entrada
      if (this.entradaFijaDate) {
        if (salidaComerDate && salidaComerDate.getTime() < this.entradaFijaDate.getTime()) {
          salidaComerDate.setDate(salidaComerDate.getDate() + 1);
        }
        if (regresoComerDate && regresoComerDate.getTime() < this.entradaFijaDate.getTime()) {
          regresoComerDate.setDate(regresoComerDate.getDate() + 1);
        }
      }

      if (salidaComerDate && regresoComerDate) {
        const ms = regresoComerDate.getTime() - salidaComerDate.getTime();
        limiteHoras = ms / (1000 * 60 * 60);
        minutosComidaMax += Math.floor(ms / (1000 * 60));
      } else if (config.tiempo_comida_max) {
        limiteHoras = config.tiempo_comida_max;
        minutosComidaMax += config.tiempo_comida_max * 60;
      }

      const llaveComidaBackend = `comida_${index}`;
      const nodoComida = this.nodoComidasBackend ? this.nodoComidasBackend[llaveComidaBackend] : null;

      this.listaComidasUI.push({
        llave: llaveComidaBackend,
        nombre: config.nombre || `Comida ${index + 1}`,
        limiteHoras: limiteHoras,
        hora_salida_comer: salidaComerDate,
        hora_regreso_comer: regresoComerDate,
        inicio: nodoComida?.COMIDA_INICIO ? parseTimestamp(nodoComida.COMIDA_INICIO) : null,
        fin: nodoComida?.COMIDA_FIN ? parseTimestamp(nodoComida.COMIDA_FIN) : null
      });
    });

    this.comidaMax = minutosComidaMax > 0 ? (minutosComidaMax / 60) : 3;

    if (this.registro.entrada) {
      this.calcularMetricas();
    }
    
    this.cargandoHistorial = false;
  }

  calcularMetricas() {
    if (!this.registro.entrada) return;
    const fechaEntrada = new Date(this.registro.entrada);
    const ahora = new Date(new Date().getTime() + this.offsetMs);

    let tiempoComidaTotalMs = 0;
    this.listaComidasUI.forEach(c => {
      if (c.inicio) {
        const fin = c.fin ? c.fin.getTime() : ahora.getTime();
        tiempoComidaTotalMs += (fin - c.inicio.getTime());
      }
    });

    if (this.tipoEsquema === 'FIJO' && this.salidaFijaDate && this.entradaFijaDate) {
      this.salidaTentativa = this.horaSalidaFija;

      const finDeCalculo = this.registro.salida ? new Date(this.registro.salida).getTime() : ahora.getTime();
      let tiempoTrabajoMs = finDeCalculo - fechaEntrada.getTime();
      tiempoTrabajoMs -= tiempoComidaTotalMs;
      if (tiempoTrabajoMs < 0) tiempoTrabajoMs = 0;

      const minsTotales = Math.floor(tiempoTrabajoMs / (1000 * 60));
      this.horasCumplidas = `${Math.floor(minsTotales / 60).toString().padStart(2, '0')}:${(minsTotales % 60).toString().padStart(2, '0')}`;

      const duracionTurnoTeoricoMs = this.salidaFijaDate.getTime() - this.entradaFijaDate.getTime();
      if (duracionTurnoTeoricoMs > 0) {
        let progreso = (finDeCalculo - fechaEntrada.getTime()) / duracionTurnoTeoricoMs;
        this.progresoJornada = progreso > 1 ? 1 : (progreso < 0 ? 0 : progreso);
      } else {
        this.progresoJornada = 0;
      }

      if (finDeCalculo > this.salidaFijaDate.getTime()) {
        const minExtras = Math.floor((finDeCalculo - this.salidaFijaDate.getTime()) / (1000 * 60));
        this.horasExtras = `${Math.floor(minExtras / 60).toString().padStart(2, '0')}:${(minExtras % 60).toString().padStart(2, '0')}`;
      } else {
        this.horasExtras = '00:00';
      }

    } else {
      const msPorHora = 60 * 60 * 1000;
      const fechaSalidaEstimada = new Date(fechaEntrada.getTime() + ((this.jornadaEf + this.comidaMax) * msPorHora));
      
      this.salidaTentativa = `${fechaSalidaEstimada.getHours().toString().padStart(2, '0')}:${fechaSalidaEstimada.getMinutes().toString().padStart(2, '0')}`;

      let tiempoTrabajadoMs = ahora.getTime() - fechaEntrada.getTime();
      tiempoTrabajadoMs -= tiempoComidaTotalMs;
      if (tiempoTrabajadoMs < 0) tiempoTrabajadoMs = 0;

      const totalMinutosEfectivos = Math.floor(tiempoTrabajadoMs / (1000 * 60));
      this.horasCumplidas = `${Math.floor(totalMinutosEfectivos / 60).toString().padStart(2, '0')}:${(totalMinutosEfectivos % 60).toString().padStart(2, '0')}`;

      if (totalMinutosEfectivos > (this.jornadaEf * 60)) {
        const minExtras = totalMinutosEfectivos - (this.jornadaEf * 60);
        this.horasExtras = `${Math.floor(minExtras / 60).toString().padStart(2, '0')}:${(minExtras % 60).toString().padStart(2, '0')}`;
      } else {
        this.horasExtras = '00:00';
      }

      const progreso = totalMinutosEfectivos / (this.jornadaEf * 60);
      this.progresoJornada = progreso > 1 ? 1 : (progreso < 0 ? 0 : progreso);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  sincronizarReloj() {
    this._asistenciaService.getTime({ tz: this.timeZoneActiva }).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.offsetMs = res.data.serverTime - new Date().getTime();
        }
      },
      error: (err) => console.warn('Fallo de sincronización de reloj:', err)
    });    
  }

  iniciarReloj() {
    if (this.timer) clearInterval(this.timer);
    this.refrescarHora();
    this.timer = setInterval(() => this.refrescarHora(), 1000);
  }

  private refrescarHora() {
    const ahoraReal = new Date(new Date().getTime() + this.offsetMs);
    
    this.horaActual = ahoraReal.toLocaleTimeString('es-MX', {
      timeZone: this.timeZoneActiva, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });

    if (!this.fechaLegible) {
      let str = ahoraReal.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      this.fechaLegible = str.charAt(0).toUpperCase() + str.slice(1);
    }

    if (this.registro.entrada && !this.registro.salida) {
      this.calcularMetricas(); 

      this.comidaActivaEnProgreso = this.listaComidasUI.find(c => c.inicio && !c.fin);

      if (this.comidaActivaEnProgreso) {
        const diffMs = ahoraReal.getTime() - this.comidaActivaEnProgreso.inicio.getTime();
        const totalMinutos = Math.floor(diffMs / (1000 * 60));
        
        this.tiempoComidaTranscurrido = `${Math.floor(totalMinutos / 60).toString().padStart(2, '0')}:${(totalMinutos % 60).toString().padStart(2, '0')}`;
        this.progresoComida = this.comidaActivaEnProgreso.limiteHoras > 0 ? (totalMinutos / (this.comidaActivaEnProgreso.limiteHoras * 60)) : 0;
        if (this.progresoComida > 1) this.progresoComida = 1;
      }
    }
  }

  get estadoActual() {
    if (this.registro.salida) return { texto: 'Jornada Finalizada', color: 'dark' };
    if (this.comidaActivaEnProgreso) return { texto: `En ${this.comidaActivaEnProgreso.nombre}`, color: 'warning' };
    if (this.registro.entrada) return { texto: 'Laborando', color: 'success' };
    return { texto: 'Sin iniciar turno', color: 'medium' };
  }

  obtenerComidasCompletadas(): number {
    return this.listaComidasUI.filter(c => c.inicio && c.fin).length;
  }

  esComidaHabilitada(index: number): boolean {
    if (index === 0) return !!this.registro.entrada;
    const comidaAnterior = this.listaComidasUI[index - 1];
    return !!(comidaAnterior && comidaAnterior.inicio && comidaAnterior.fin);
  }

  algunaSalaDeComidaActiva(): boolean {
    return this.listaComidasUI.some(c => c.inicio && !c.fin);
  }

  todasLasComidasObligatoriasListas(): boolean {
    if (this.tipoEsquema !== 'FIJO') return true;
    return this.listaComidasUI.every(c => c.inicio && c.fin);
  }

  async registrar(tipo: string) {
    if (this.bloqueoBoton) return;
    this.bloqueoBoton = true;

    const coords = await this._geoService.getPosition();
    if (!coords) {
      this.bloqueoBoton = false;
      return;
    }

    const userStr = await this._preferencesService.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const idJornadaGuardado = await this._preferencesService.getItem('id_jornada_activa');

    const datosRegistro: any = {
      tipo: tipo, 
      id_tienda: user.id_tienda || '',
      nombre_usuario: `${user.nombre || ''} ${user.apellido_paterno || ''}`,
      ubicacion: { lat: coords.latitude, lng: coords.longitude }
    };

    if (idJornadaGuardado) {
      datosRegistro.id_jornada = idJornadaGuardado;
    }

    this._asistenciaService.post(datosRegistro).subscribe({
      next: async (res: any) => {
        const textoToast = tipo.replace('_', ' ').toUpperCase();
        this._toastService.show(`¡${textoToast} registrado con éxito!`, 'success', 'time-outline');      
        const jornadaData = res?.data ? res.data : res;

        if (tipo.toLowerCase() === 'entrada' && jornadaData && (jornadaData.id || res.id)) {
          const idDocumento = jornadaData.id || res.id;
          await this._preferencesService.setItem('id_jornada_activa', idDocumento);
        } 
        else if (tipo.toLowerCase() === 'salida') {
          await this._preferencesService.removeItem('id_jornada_activa');
        }

        this.bloqueoBoton = false; 
        this.cargarAsistenciasDia();
      },
      error: (err) => {
        console.error('Error al registrar asistencia:', err);
        this.bloqueoBoton = false; 
      }
    });
  }
}