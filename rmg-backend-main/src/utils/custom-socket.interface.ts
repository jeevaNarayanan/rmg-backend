// src/utils/custom-socket.interface.ts
import { Socket } from 'socket.io';

export interface CustomSocket extends Socket {
    user?: any;
}
