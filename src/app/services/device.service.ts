import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(    
  ) { }

  async getDeviceId(){  
    return (await Device.getId()).identifier;
  }

  async getModel(){  
    return (await Device.getInfo()).model;
  }

  async getManufacturer(){  
    return (await Device.getInfo()).manufacturer;
  }

  async getOperationSystem(){  
    return (await Device.getInfo()).operatingSystem;
  }

  async getOsVersion(){  
    return (await Device.getInfo()).osVersion;
  }

  async getPlatform(){  
    return (await Device.getInfo()).platform;
  }
}
