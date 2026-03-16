import { Injectable } from '@angular/core';
import { Device, DeviceInfo, DeviceId } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(    
  ) { }

  async getDeviceId(): Promise<string> {
    const { identifier } = await Device.getId();
    return identifier;
  }

  async getInfo(): Promise<DeviceInfo> {
    return await Device.getInfo();
  }

  async getModel(): Promise<string> {
    const info = await this.getInfo();
    return info.model;
  }

  async getManufacturer(): Promise<string> {
    const info = await this.getInfo();
    return info.manufacturer;
  }
  
  async getOperationSystem(): Promise<string> {
    const info = await this.getInfo();
    return info.operatingSystem;
  }
  
  async getOsVersion(): Promise<string> {
    const info = await this.getInfo();
    return info.osVersion;
  }

  async getPlatform(): Promise<'ios' | 'android' | 'web'> {
    const info = await this.getInfo();
    return info.platform;
  }
}
