import {describe,it,expect} from 'vitest';
import {buildFeedbackReport} from './feedback-report.js';
describe('explicit feedback report',()=>{
 it('includes only selected non-secret technical context',()=>{const report=buildFeedbackReport({description:'Dice did not roll',locale:'ru',version:'0.1.3',hash:'#gm',url:'https://example.test/?pin=123456',token:'secret',privateNotes:'hidden'});expect(report).toEqual({format:'masterhost.feedback.v1',version:'0.1.3',locale:'ru',screen:'gm',description:'Dice did not roll'});expect(JSON.stringify(report)).not.toContain('secret');expect(JSON.stringify(report)).not.toContain('123456');expect(JSON.stringify(report)).not.toContain('hidden')});
 it('rejects blank reports and bounds submitted text',()=>{expect(()=>buildFeedbackReport({description:'  ',locale:'ru',hash:'#join'})).toThrow();expect(buildFeedbackReport({description:'a'.repeat(6000),locale:'ru',hash:'#unexpected-secret'}).description.length).toBe(4000);expect(buildFeedbackReport({description:'Report',locale:'ru',hash:'#unexpected-secret'}).screen).toBe('other')});
});
