import { Subject } from 'rxjs';

export class CardService {
  static completed: Subject<boolean> = new Subject();
}