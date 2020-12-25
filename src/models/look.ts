import { Entity } from 'prismarine-entity';

export interface ILookData {
    target: Entity;
    interval: NodeJS.Timeout;
}