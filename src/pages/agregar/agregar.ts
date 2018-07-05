import { Component } from '@angular/core';
import { ViewController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

//plugins angularfire2
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
//Modelos de datos
import { Platillo } from '../../commons/platillo';
//Camára
import { Camera, CameraOptions } from '@ionic-native/camera';
//Galería
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

import * as firebase from 'firebase';


@IonicPage()
@Component({
  selector: 'page-agregar',
  templateUrl: 'agregar.html',
})
export class AgregarPage {

  private itemsCollection: AngularFirestoreCollection<Platillo>;

  nombre: string;
  tipo: string;
  img: string;

  //Miniatura de la Imagen
  imagePreview: string = "";
  //Imagen en formato para subir
  imagen64: string;
  //Observables
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  tomarDatosURL: any;

  constructor(public readonly afs: AngularFirestore,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public storageFS: AngularFireStorage,
    private camera: Camera,
    private imagePicker: ImagePicker) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AgregarPage');
  }

  agregarPlatillo() {
    console.log("platillo agregado");

    this.itemsCollection = this.afs.collection<Platillo>('platillo');
    /* this.platillos = this.itemsCollection.snapshotChanges().pipe(
       map(actions => actions.map(a => {
         const data = a.payload.doc.data() as Platillo;
         const id = a.payload.doc.id;
         return { id, ...data };
       }))
     ); */

    const id = this.afs.createId(); //Crea un ID automáticamente
    //El registro debe ser completo
    if (this.nombre != null && this.tipo != null && this.img != null) {
      //Creando arreglo/objeto para su posterior envío
      const plato: Platillo = { 'nombre': this.nombre, 'tipo': this.tipo, 'img': this.img }
      console.table(plato);
      //Registrando en Firebase
      this.afs.collection('platillo').doc(id).set(plato);
      //Registro exitoso (o deberia)
      this.marcarRegistro();
      //Cerrando registro
      this.viewCtrl.dismiss();

    } else {
      //El registro no es completo
      this.marcarError("¡Platillo Incompleto!");
    }

  }


  //Funcion de Cámara
  presentarCamara() {

    //Formato de la imagen a tomar
    const config: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    }

    //Promesa: Sí se pudo tomar la foto con la configuración indicada..
    this.camera.getPicture(config).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.imagePreview = 'data:image/jpeg;base64,' + imageData;
      this.imagen64 = imageData;
    }, (err) => {
      console.log("Error en cámara", JSON.stringify(err));
      this.marcarError("¡No se pudo tomar la foto!");
    });

  }

  //Función de Galería
  presentarGaleria() {

    //Configuración de la imagen
    let conf: ImagePickerOptions = {
      quality: 70,
      outputType: 1, //Devuelve un string codificado base-64
      maximumImagesCount: 1
    }

    //Promesa: sí logra tomar una foto con la configuración dada...
    this.imagePicker.getPictures(conf).then((results) => {
      for (var i = 0; i < results.length; i++) {
        // console.log('Image URI: ' + results[i]);
        this.imagePreview = 'data:image/jpeg;base64,' + results[i];
        this.imagen64 = results[i];

      }
    }, (err) => {
      console.log("ERROR: la imagen no es valida: ", JSON.stringify(err));
      this.marcarError('¡La imagen no es válida!');
    });


  }

  subirFoto(event) {
    const file = event.target.files[0];
    const filePath = '/FirePic/Platillos/' + this.nombre;
    const fileRef = this.storageFS.ref(filePath);
    //Carga de imagen por funcion "upload"
    const task = this.storageFS.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();

        this.downloadURL.subscribe(imgURL => {
          //console.log("imgURL: " + imgURL);
          this.img = imgURL;
        })

      }
      )
    )
      .subscribe()

  }


  //Carga Asicnrona de imagenes (funciona junto a un <input type ="file">)
  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = '/pruebas/' + this.nombre;
    const fileRef = this.storageFS.ref(filePath);
    const task = this.storageFS.upload(filePath, file);

    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();

        //Tomando la URL tras descargarla
        this.downloadURL.subscribe(imgURL => {
          //console.log("imgURL: " + imgURL);
          this.img = imgURL;
        })

      }
      )
    )
      .subscribe()

  }

  marcarRegistro() {
    const toast = this.toastCtrl.create({
      message: '¡Hay nuevo platillo!',
      duration: 2500
    });
    toast.present();
  }

  marcarError(mensaje: string) {
    const toast = this.toastCtrl.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }




  capturarImagen() {
    const cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(cameraOptions).then((imageData) => {
      this.tomarDatosURL = imageData;
    }, (err) => {
      // Handle error
    });
  }

  private abrirGaleria(): void {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL, // Change FILE_URI to DATA_URL
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((file_uri) => {
      /* Remove 'data:image/jpeg;base64,' 
         FYI : You can use another variable to bind src attribute in <img> tag
         you have to prepend 'data:image/jpeg;base64,' to that variable
      */
      this.tomarDatosURL = file_uri;
    },
      err => console.log(err));
  }

  // To store image in firebase storage


}
