//Plug-ins por defecto
import { Component } from '@angular/core';
//import { NavController } from 'ionic-angular';
//Plug-ins adicionales
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
//Modelos de Datos Internos
import { Bebida } from '../../commons/bebida'

@Component({
  selector: 'page-home',
  templateUrl: 'bebidas.html'
})
export class BebidasPage {

  private itemsCollection: AngularFirestoreCollection<Bebida>;

  bebidas: Observable<Bebida[]>;

  constructor(
    private readonly afs: AngularFirestore) {

    //Acceso a los Datos en Firebase
    this.itemsCollection = afs.collection<Bebida>('bebidas');
    //Obtención de 
    this.bebidas = this.itemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Bebida;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

}

