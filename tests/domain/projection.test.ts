import { it,expect } from 'vitest';
import { initialTable,connectMember,project,ownState } from '../../packages/domain/src/index.js';
it('never exposes votes or sequence in public open state',()=>{const s=connectMember(initialTable('table','round'),'a','Ana',1);s.votes.a=34;s.members.a!.lastSequence=19;const p=project(s);expect(p.revealed).toBeNull();expect(JSON.stringify(p)).not.toContain('34');expect(JSON.stringify(p)).not.toContain('lastSequence');expect(ownState(s,'a').value).toBe(34);expect(ownState(s,'b').value).toBeNull();});
