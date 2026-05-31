import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EntregaService } from '@services/entrega.service';
import { PreferencesService } from '@services/preference.service';
import { EntregaInterface } from '@interfaces/entrega-interface';
import { ToastService } from '@services/toast.service'; // Tu servicio de toast
import { ColoniaService } from '@services/colonia.service';

@Component({
  selector: 'app-form-entregas',
  templateUrl: './form-entregas.component.html',
  styleUrls: ['./form-entregas.component.scss'],
})
export class FormEntregasComponent  implements OnInit {

  // Objeto con la estructura que pediste
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

  // DATOS DUMMY: Catálogo maestro escalable (Aquí puedes inyectar datos de una API después)
  listaColonias: any[] = [];

  // Lista dinámica que se renderiza en el modal de búsqueda
  filteredColonias: any[] = [];

  constructor(
    private _entregaService: EntregaService,
    private _preferencesService: PreferencesService,
    private router: Router,
    private _toastService: ToastService,
    private _coloniaService: ColoniaService,
  ) { }

  async ngOnInit() {
    // 1. Cargamos el catálogo de colonias desde el servidor backend
    this.obtenerColonias();

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
  }

  // --- CONSUMO DEL SERVICIO REAL ---
  async obtenerColonias() {
    //this.cargandoColonias = true;
    const userStr = await this._preferencesService.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    const datos = {
      activo: 1, 
      ignorarLimite: true,         
      id_tienda: user.id_tienda
    };

    this._coloniaService.get(datos).subscribe({
      next: (res: any) => {
        // Mapea la respuesta según como te la entregue tu backend (ej: res o res.data)
        this.listaColonias = Array.isArray(res) ? res : (res.data || []);
        
        // Inicializamos el filtro con los datos reales recibidos
        this.filteredColonias = [...this.listaColonias];
        //this.cargandoColonias = false;
      },
      error: (err) => {
        //this.cargandoColonias = false;
        console.error('Error al cargar colonias:', err);
        //this._toastService.show('No se pudo cargar el catálogo de colonias', 'danger', 'alert-circle-outline');
      }
    });
  }

  // --- LÓGICA DEL BUSCADOR ESCALABLE ---
  filtrarColonias(event: any) {
    const busqueda = event.target.value ? event.target.value.toLowerCase().trim() : '';

    if (busqueda === '') {
      this.filteredColonias = [...this.listaColonias];
      return;
    }

    // Filtra en tiempo real sin importar mayúsculas/minúsculas
    this.filteredColonias = this.listaColonias.filter(col => 
      col.nombre.toLowerCase().includes(busqueda)
    );
  }

  seleccionarColonia(colonia: any, modal: any) {
    // Guardamos la propiedad 'nombre' directamente en la propiedad del JSON que viaja a tu API
    this.entrega.colonia = colonia.nombre;
    this.entrega.id_colonia = colonia.id;
    
    // Cerramos el modal
    modal.dismiss();

    // Limpiamos la búsqueda para que la siguiente vez aparezca completa
    this.filteredColonias = [...this.listaColonias];
  }

  async guardar() {
    // Validación básica
    if (!this.entrega.folio || !this.entrega.persona_recibe || !this.entrega.colonia) {
      this._toastService.show('Por favor rellena todos los campos', 'warning', 'warning-outline');
      return;
    }

    // Decidimos si es POST (nuevo) o PUT (editar)
    const peticion = this.entrega.id 
      ? this._entregaService.put(this.entrega as EntregaInterface) 
      : this._entregaService.post(this.entrega as EntregaInterface);

    peticion.subscribe({
      next: (res) => {
        this._toastService.show('¡Entrega guardada con éxito!', 'success', 'checkmark-circle-outline');
        this.router.navigate(['/entregas'], { replaceUrl: true }); // Regresamos a la lista
      },
      error: (err) => {
        /*// --- MANEJO DE ERRORES DINÁMICO ---
        let mensajeError = 'Error al conectar con el servidor';

        // Si el servidor mandó un error 400 o similar con un mensaje
        if (err.error && err.error.message) {
          mensajeError = err.error.message;
        } else if (typeof err.error === 'string') {
          mensajeError = err.error;
        }

        // Mostramos el mensaje real que viene del Backend
        this._toastService.show(mensajeError, 'danger', 'alert-circle-outline');*/
        console.error('Error detallado:', err);
      }
    });
  }
}
