import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  constructor(private toastController: ToastController) {}

  async success(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'success',
      position: 'top',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async error(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      color: 'danger',
      position: 'top',
      buttons: [{ text: 'Dismiss', role: 'cancel' }]
    });
    await toast.present();
  }

  async info(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'primary',
      position: 'top'
    });
    await toast.present();
  }
}