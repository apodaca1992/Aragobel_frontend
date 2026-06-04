import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-colonias',
  templateUrl: './list-colonias.component.html',
  styleUrls: ['./list-colonias.component.scss'],
})
export class ListColoniasComponent implements OnInit {

  filtros: any = {
    nombre: ''
  };

  // Base de datos limpia con puros nombres e IDs auto-incrementales
  listaColoniasMaster: any[] = [
    { id: 1, nombre: 'Centro Histórico' },
    { id: 2, nombre: 'Las Quintas' },
    { id: 3, nombre: 'Tres Ríos' },
    { id: 4, nombre: 'Infonavit Humaya' },
  ];

  coloniasFiltradas: any[] = [];

  constructor(private router: Router) { }

  ngOnInit() {
    this.coloniasFiltradas = [...this.listaColoniasMaster];
  }

  hasColonias(): boolean {
    return this.coloniasFiltradas && this.coloniasFiltradas.length > 0;
  }

  aplicarFiltros() {
    this.coloniasFiltradas = this.listaColoniasMaster.filter(colonia => {
      return !this.filtros.nombre || colonia.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase());
    });
  }

  editColonia(id: number) {
    this.router.navigate([`/panel-admin/colonias/editar/${id}`]);
  }

  deleteColonia(colonia: any) {
    console.log('Eliminado:', colonia);
    this.listaColoniasMaster = this.listaColoniasMaster.filter(c => c.id !== colonia.id);
    this.aplicarFiltros();
  }
}