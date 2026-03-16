import { Injectable, NgZone } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService } from '@services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  // Usamos BehaviorSubject para que cualquier componente sepa el estado actual al suscribirse
  private statusSubject = new BehaviorSubject<boolean>(true);
  
  constructor(
    private zone: NgZone, 
    private toast: ToastService
  ) {
    this.initializeNetworkCheck();
  }

  private async initializeNetworkCheck() {
    // 1. Obtener estado inicial
    const status = await Network.getStatus();
    this.statusSubject.next(status.connected);

    // 2. Escuchar cambios
    Network.addListener('networkStatusChange', (status) => {
      // NgZone asegura que Angular detecte el cambio de estado inmediatamente
      this.zone.run(() => {
        console.log('Network status changed', status);
        this.statusSubject.next(status.connected);
        
        if (!status.connected) {
          this.toast.show('Sin conexión a Internet', 'danger', 'cloud-offline-outline');
        } else {
          this.toast.show('Conexión restaurada', 'success', 'cloud-done-outline');
        }
      });
    });
  }

  // Exponer el estado como Observable para los componentes
  get onNetworkChange(): Observable<boolean> {
    return this.statusSubject.asObservable();
  }

  // Método síncrono rápido
  public isConnected(): boolean {
    return this.statusSubject.value;
  }
}
/*
<ion-button [disabled]="!(networkService.onNetworkChange | async)">
  Enviar Datos
</ion-button>
*/