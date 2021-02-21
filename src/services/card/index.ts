import { BehaviorSubject, Subject } from 'rxjs';

export class CardService {
  static completed: Subject<boolean> = new Subject();
  static authenticationCompleted: Subject<any> = new Subject();
}