import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  constructor(private alertController: AlertController) {}

  async show(
    title: string, 
    message: string, 
    cancelText: string = 'Cancel', 
    confirmText: string = 'Confirm'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        message: message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          },
          {
            text: confirmText,
            role: 'confirm',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }
}