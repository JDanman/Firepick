//Plug-ins por defecto
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//Plug-ins adicionales
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
//Modelos de Datos Internos
import { Platillo } from '../../commons/platillo'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private itemsCollection: AngularFirestoreCollection<Platillo>;

  platillos: Observable<Platillo[]>;

  constructor(
    private readonly afs: AngularFirestore) {

    //Acceso a los Datos en Firebase
    this.itemsCollection = afs.collection<Platillo>('platillo');
    //Obtención de 
    this.platillos = this.itemsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Platillo;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

}

