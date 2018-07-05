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
      this.marcarRegistro("¡Hay nuevo platillo!");
      //Cerrando registro
      this.viewCtrl.dismiss();

    } else {
      //El registro no es completo
      this.marcarError("¡Platillo Incompleto!");
    }

  }

  //Funcion alternativa propuesta para subir imagenes ageno a la funcion del input type file
  agregarPlatillo02() {
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
    if (this.nombre != null && this.tipo != null) {

      //Cargando la imagen en el servidor
      const file = this.imagePreview;
      const filePath = '/FirePic/Platillos/' + this.nombre;
      const fileRef = this.storageFS.ref(filePath);
      //Carga de imagen por funcion "upload"
      const task = this.storageFS.upload(filePath, file);
      this.marcarRegistro("Cargando imagen...");

      // Mostrando el porcentage de carga
      this.uploadPercent = task.percentageChanges();
      // cuando el URL de descarga se encuentra disponible
      task.snapshotChanges().pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(imgURL => {
            //console.log("imgURL: " + imgURL);
            this.img = imgURL;

            //La imagen ya se encuentra disponible (deberia)
            //Creando arreglo/objeto para su posterior envío
            const plato: Platillo = { 'nombre': this.nombre, 'tipo': this.tipo, 'img': this.img }
            console.table(plato);
            //Registrando en Firebase
            this.afs.collection('platillo').doc(id).set(plato);
            //Registro exitoso (o deberia)
            this.marcarRegistro("¡Hay nuevo platillo!");
            //Cerrando registro
            this.viewCtrl.dismiss();

          }, (err) => {
            console.log("Error al cargar", err);
            this.marcarError("¡La imagen no pudo subirse!");
          });

        }
        )
      )
        .subscribe()

    } else {
      //El registro no es completo
      this.marcarError("¡Platillo Incompleto!");
    }

  }


  //Funcion de Cámara
  presentarCamara(src:number) {

    //Formato de la imagen a tomar
    const config: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: true,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: src // 0 = Galeria, 1 = Camara
    }

    //Promesa: Sí se pudo tomar la foto con la configuración indicada..
    this.camera.getPicture(config).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.imagePreview = 'data:image/jpeg;base64,' + imageData;
      this.imagen64 = imageData;
      
      this.uploadFile(imageData);
    }, (err) => {
      console.log("Error en cámara", JSON.stringify(err));
      this.marcarError("¡No se pudo tomar la foto!");
    });

  }

  //Función de Galería
  presentarGaleria() {

    //Configuración de la imagen
    let conf: ImagePickerOptions = {
      quality: 50,
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

  marcarRegistro(msg:string) {
    const toast = this.toastCtrl.create({
      message: msg,
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


}
