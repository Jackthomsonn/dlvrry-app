import { Subject } from 'rxjs';

export class PaymentService {
  static completed: Subject<boolean> = new Subject();
}