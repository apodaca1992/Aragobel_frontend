import { Injectable } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {  
  networkStatus!: ConnectionStatus;

  constructor() { 
    if(Network){
      Network.getStatus().then((status) =>{
        this.networkStatus = status;
      });
    }
    Network.addListener('networkStatusChange', networkStatus2 => {
      setTimeout(async () => {
        this.networkStatus = await Network.getStatus();
      }, 100);
    });
  }

  public isConnected(){
    if(Network){
      return this.networkStatus.connected;
    }else{
      return false;
    }
  }

  public getNameNetwork(){
    if(Network){
      return this.networkStatus.connectionType.toString();
    }else{
      return '';
    }
  }
}
