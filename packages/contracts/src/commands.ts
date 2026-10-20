import { z } from 'zod';
import { DECK, SUITS, type Vote } from './constants.js';
export const nameSchema = z.string().transform(s => s.normalize('NFC').trim()).refine(s => [...s].length >= 1 && [...s].length <= 32 && !/\p{Cc}/u.test(s));
export const voteSchema = z.custom<Vote>(v => DECK.some(n => n === v));
const envelope = { commandId: z.uuid(), sequence: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), roundId: z.uuid() };
const empty = z.strictObject({});
export const commandSchema = z.discriminatedUnion('type', [
  z.strictObject({...envelope, type:z.literal('vote'),payload:z.strictObject({value:voteSchema})}),
  z.strictObject({...envelope, type:z.literal('withdraw'),payload:empty}),
  z.strictObject({...envelope, type:z.literal('reveal'),payload:empty}),
  z.strictObject({...envelope, type:z.literal('clear'),payload:empty}),
  z.strictObject({...envelope, type:z.literal('setMode'),payload:z.strictObject({mode:z.enum(['voter','observer'])})}),
  z.strictObject({...envelope, type:z.literal('setSuit'),payload:z.strictObject({suit:z.enum(SUITS)})}),
]);
export type Command = z.infer<typeof commandSchema>;
export type Action = {type:'vote';payload:{value:Vote}} | {type:'setMode';payload:{mode:'voter'|'observer'}} | {type:'setSuit';payload:{suit:typeof SUITS[number]}} | {type:'withdraw'|'reveal'|'clear';payload:Record<string,never>};
