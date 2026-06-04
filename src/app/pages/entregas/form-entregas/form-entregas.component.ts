import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntregaService } from '@services/entrega.service';
import { PreferencesService } from '@services/preference.service';
import { EntregaInterface } from '@interfaces/entrega-interface';
import { ToastService } from '@services/toast.service'; 
import { ColoniaService } from '@services/colonia.service';
import { GeolocationService } from '@services/geolocation.service';

@Component({
  selector: 'app-form-entregas',
  templateUrl: './form-entregas.component.html',
  styleUrls: ['./form-entregas.component.scss'],
})
export class FormEntregasComponent implements OnInit {

  // Objeto con la estructura de la base de datos
  entrega: Partial<EntregaInterface> = {
    folio: '',
    persona_recibe: '',
    id_colonia: '',
    colonia: '',
    estatus: 1,
    activo: 1,
    id_tienda: null,
    id_usuario_creador: null,
    nombre_usuario_creador: '',
    fecha_venta: ''
  };

  // Lista dinámica que se renderiza bajo demanda desde la API
  filteredColonias: any[] = [];

  // Bandera de carga para la UI del modal
  cargandoColonias: boolean = false;

  constructor(
    private _entregaService: EntregaService,
    private _preferencesService: PreferencesService,
    private router: Router,
    private _toastService: ToastService,
    private _coloniaService: ColoniaService,
    private _geoService: GeolocationService
  ) { }

  async ngOnInit() {
    // 1. Primero capturamos si viene una entrega para edición
    const state = this.router.getCurrentNavigation()?.extras.state;
    
    if (state && state['entrega']) {
      // CASO EDICIÓN: Copiamos los datos existentes
      this.entrega = { ...state['entrega'] };
      console.log('Modo edición:', this.entrega);
    } else {
      // CASO NUEVA ENTREGA: Seteamos valores por defecto
      console.log('Modo creación');
      this.entrega.id_usuario_creador = await this._preferencesService.getIdUser();      
      
      const userStr = await this._preferencesService.getItem('user');
      if (userStr) {
          const user = JSON.parse(userStr);
          this.entrega.id_tienda = user.id_tienda;
          this.entrega.nombre_usuario_creador = user.nombre + ' ' + user.apellido_paterno + ' ' + user.apellido_materno;

          // Generamos la fecha del día para el filtro rápido
          this.entrega.fecha_venta = `TODAY|${user.id_tienda}`;
      }    
    }

    // 2. Realizamos una carga inicial sugerida limitada al abrir
    this.obtenerColoniasIniciales();
  }

  // Carga opcional de las primeras 10 colonias (LÍMITE OPTIMIZADO)
  async obtenerColoniasIniciales() {
    const userStr = await this._preferencesService.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const datos = {
      activo: 1, 
      limit: 10, // 👈 Cambiado a un bloque fijo de 10 registros
      id_tienda: user.id_tienda
    };

    this.cargandoColonias = true;
    this._coloniaService.get(datos).subscribe({
      next: (res: any) => {
        this.filteredColonias = Array.isArray(res) ? res : (res.data || []);
        this.cargandoColonias = false;
      },
      error: (err) => {
        this.cargandoColonias = false;
        console.error('Error al cargar catálogo inicial:', err);
      }
    });
  }

  // Lógica del buscador asíncrono dinámico (LÍMITE OPTIMIZADO)
  async filtrarColonias(event: any) {
    const busqueda = event.target.value ? event.target.value.toLowerCase().trim() : '';

    // Si el usuario borra el texto de búsqueda, restablecemos a las 10 iniciales sugeridas
    if (busqueda.length < 2) {
      this.obtenerColoniasIniciales();
      return;
    }

    const userStr = await this._preferencesService.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    this.cargandoColonias = true;

    const parametros: any = {
      activo: 1,
      id_tienda: user.id_tienda,
      limit: 10 // 👈 Cambiado a 10 para agilizar la transferencia NoSQL
    };

    // Filtros de prefijo heredados de tu query base
    parametros.nombre_search_gte = busqueda;
    parametros.nombre_search_lte = busqueda + '\uf8ff';

    this._coloniaService.get(parametros).subscribe({
      next: (res: any) => {
        this.filteredColonias = Array.isArray(res) ? res : (res.data || []);
        this.cargandoColonias = false;
      },
      error: (err) => {
        this.cargandoColonias = false;
        this.filteredColonias = [];
        console.error('Error al consultar colonias asíncronas:', err);
      }
    });
  }

  seleccionarColonia(colonia: any, modal: any) {
    this.entrega.colonia = colonia.nombre;
    this.entrega.id_colonia = colonia.id;
    
    modal.dismiss();

    // Restablecemos el lote inicial para cuando se vuelva a abrir
    this.obtenerColoniasIniciales();
  }

  async guardar() {
    if (!this.entrega.folio || !this.entrega.persona_recibe || !this.entrega.colonia) {
      this._toastService.show('Por favor rellena todos los campos', 'warning', 'warning-outline');
      return;
    }

    const coords = await this._geoService.getPosition();
    if (!coords) {
      return;
    }
    this.entrega.ubicacion = { lat: coords.latitude, lng: coords.longitude };

    const peticion = this.entrega.id 
      ? this._entregaService.put(this.entrega as EntregaInterface) 
      : this._entregaService.post(this.entrega as EntregaInterface);

    peticion.subscribe({
      next: (res) => {
        this._toastService.show('¡Entrega guardada con éxito!', 'success', 'checkmark-circle-outline');
        this.router.navigate(['/entregas'], { replaceUrl: true }); 
      },
      error: (err) => {
        console.error('Error detallado:', err);
      }
    });
  }
}