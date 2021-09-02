
import { Event } from '@iapetus/types';
import axios from 'axios';
import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

import { MemoryEmitter }  from './MemoryEmitter';

export class FirebaseEmitter extends MemoryEmitter {

  private firebaseAuth: Auth;

  constructor(firebase: FirebaseApp) {
    super();
    this.firebaseAuth = getAuth(firebase);
  }

  async emit(event: Event): Promise<void> {
    await super.emit(event);
    await this.queue(event);
  }

  private async queue(event: Event): Promise<void> {
    try {
      const user = this.firebaseAuth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        await axios.post(`/emit`, {
          topic: event.name,
          data: JSON.stringify(event),
          attributes: event.attributes
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

}
