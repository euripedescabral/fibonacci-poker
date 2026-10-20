import type { Suit, Vote } from './constants.js';
import type { ErrorCode } from './errors.js';
export type ModeResult = {kind:'mode';values:number[];count:number} | {kind:'no-numeric-votes'};
export interface Member {id:string;name:string;mode:'voter'|'observer';connected:boolean;seat:number;lastSequence:number;lastSeen:number}
export interface RevealedCard {id:string;name:string;value:Vote;offline:boolean}
export interface Snapshot {tableId:string;roundId:string;revision:number;phase:'open'|'revealed';suit:Suit;completionEmitted:boolean;members:Record<string,Member>;votes:Record<string,Vote>;revealed:null|{cards:RevealedCard[];result:ModeResult}}
export interface PublicMember {id:string;name:string;mode:'voter'|'observer';connected:boolean;seat:number;hasVoted:boolean}
export interface PublicState {tableId:string;roundId:string;revision:number;phase:'open'|'revealed';suit:Suit;members:PublicMember[];activeVoters:number;voted:number;submitted:number;revealed:Snapshot['revealed']}
export interface OwnState {id:string;roundId:string;value:Vote|null;lastSequence:number}
export type Reply = {ok:true;commandId:string;roundId:string;revision:number} | {ok:false;commandId?:string;code:ErrorCode};
