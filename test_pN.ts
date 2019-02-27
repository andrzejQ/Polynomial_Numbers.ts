/// <reference path="./lib/PN.ts"/>
// https://www.typescriptlang.org/docs/handbook/modules.html
// cd "$(CURRENT_DIRECTORY)"
// tsc.cmd // = tsc.cmd --build tsconfig.json
// node ./build.js
/**
 * @author kubaszek
 * Test pN
 * https://beta.observablehq.com/@andrzejq/polynomial-number-pn-class-tests
 */
MAX_N = 16; // > 10
let trace = (s:string) => {console.log(s)};
( () => {
/* BEGIN for observablehq.com ->
log = { let trace = s => {log += "\n"+s};  /**/
  let log = '';
  let ok = true;
  
  let pn:PN, pn1:PN, pn12:PN;
  pn = new PN(0); ok && trace(pn.toStringNm('p0'));
  ok = ok && pn.toString(10) === '(~0~,0~0~0~0~0~0~0~0~0~...~)'

  pn = new PN(123); ok && trace(pn.toStringNm('p1'));
  ok = ok && pn.toString(10) === '(~123~,0~0~0~0~0~0~0~0~0~...~)'

  pn = new PN(1, /*a*/ 2, /*expon*/ 3); ok && trace(pn.toStringNm('p1a'));
  ok = ok && pn.toString(10) === '2 * (~1~,0~0~0~0~0~0~0~0~0~...~) * (~1~0~)^(3)'

  pn = new PN([]); ok && trace(pn.toStringNm('p2'));
  ok = ok && pn.toString(10) === '(~0~,0~0~0~0~0~0~0~0~0~...~)'

  pn = new PN([0]); ok && trace(pn.toStringNm('p3'));
  ok = ok && pn.toString(10) === '(~0~,0~0~0~0~0~0~0~0~0~...~)'

  pn = new PN([1,2,3]); ok && trace(pn.toStringNm('p4'));
  ok = ok && pn.toString(10) === '(~1~,2~3~0~0~0~0~0~0~0~...~)'

  pn12 = new PN([1,2,3], /*a*/ 4, /*expon*/ 5); ok && trace(pn12.toStringNm('p4_a'));
  ok = ok && pn12.toString(10) === '4 * (~1~,2~3~0~0~0~0~0~0~0~...~) * (~1~0~)^(5)'
  
  pn12 = pn12.add([-1,-2,-3]); ok && trace(pn12.toStringNm('p4_b'));
  ok = ok && pn12.toString(10) === '(~4~,8~12~0~0~-1~-2~-3~0~0~...~) * (~1~0~)^(5)'
  
  pn12 = pn12.add('(~9~9~)'); ok && trace(pn12.toStringNm('p4_c'));
  ok = ok && pn12.toString(10) === '(~4~,8~12~0~9~8~-2~-3~0~0~...~) * (~1~0~)^(5)'

  pn12 = pn12.mul('(~1~1~)'); ok && trace(pn12.toStringNm('p4_d'));
  ok = ok && pn12.toString(10) === '(~4~,12~20~12~9~17~6~-5~-3~0~...~) * (~1~0~)^(6)'

  pn12 = pn12.div('(~1~1~)'); ok && trace(pn12.toStringNm('p4_e'));
  ok = ok && pn12.toString(10) === '(~4~,8~12~0~9~8~-2~-3~0~0~...~) * (~1~0~)^(5)'

  pn1 = new PN(pn); ok && trace(pn1.toStringNm('p4a'));
  ok = ok && pn1.toString(10) === '(~1~,2~3~0~0~0~0~0~0~0~...~)'

  pn1 = new PN(pn1,/*a*/ 2, /*expon*/ -3); ok && trace(pn1.toStringNm('p4b'));
  ok = ok && pn1.toString(10) === '2 * (~1~,2~3~0~0~0~0~0~0~0~...~) * (~1~0~)^(-3)'

  pn = new PN('(~1~0~)',2,3); ok && trace(pn.toStringNm('p5'));
  ok = ok && pn.toString(10) === '2 * (~1~,0~0~0~0~0~0~0~0~0~...~) * (~1~0~)^(4)'

  pn = new PN('c_P_TRAP',/*a*/ 2, /*expon*/ 3); ok && trace(pn.toStringNm('p6'));
  ok = ok && pn.toString(10) === '2 * (~2~,-4~4~-4~4~-4~4~-4~4~-4~...~) * (~1~0~)^(3)'

  if (ok)   trace('............................... from string')
  if (ok)   for (let [inp,outp] of [
     ['(~1.2~,2.5~-0.3~)*(~1~0~)^(-2)' ,'(~1.2~,2.5~-0.3~0~0~0~0~0~0~0~...~) * (~1~0~)^(-2)']
    ,['(~1.2~)'                        ,'(~1.2~,0~0~0~0~0~0~0~0~0~...~)']
    ,['(~0~,2.5~-0.3~)'                ,'(~0~,2.5~-0.3~0~0~0~0~0~0~0~...~)']
    ,['(~,2.5~-0.3~)'                  ,'(~2.5~,-0.3~0~0~0~0~0~0~0~0~...~) * (~1~0~)^(-1)']
    ,['(~-1.1~2.2~,-3.3~)'             ,'(~-1.1~,2.2~-3.3~0~0~0~0~0~0~0~...~) * (~1~0~)^(1)']
    ,['(~0.1~,2e-38~4.3~6.1e-10~)'     ,'(~0.1~,2e-38~4.3~6.1e-10~0~0~0~0~0~0~...~)']
    ,['(~1e-36~,2e-38~4.3~6.0~)'       ,'(~1e-36~,2e-38~4.3~6~0~0~0~0~0~0~...~)']
    ,['(~1~2.3~,-1~-2~)'               ,'(~1~,2.3~-1~-2~0~0~0~0~0~0~...~) * (~1~0~)^(1)']
    ,['(~1~2.3~,-1~-2~) * (~1~0~)^(3)' ,'(~1~,2.3~-1~-2~0~0~0~0~0~0~...~) * (~1~0~)^(4)']
    ,['(~1~2.3~,-1~-2~) * (~1~0~)^3'   ,'(~1~,2.3~-1~-2~0~0~0~0~0~0~...~) * (~1~0~)^(4)']
////////    ,[''                               ,'(~0~,0~0~0~0~0~0~0~0~0~...~)']
////////    ,[undefined                        ,'(~0~,0~0~0~0~0~0~0~0~0~...~)']
    ,['(~1~x~,-1~-2~) * (~1~0~)^3'     ,'(~1~,NaN~-1~-2~0~0~0~0~0~0~...~) * (~1~0~)^(4)'] //NaN
    ]) {
    let inpPN  = new PN(inp); 
    trace(`${inpPN.toStringNm(inp)}`); /** trace(`\t,'${inpPN.toString()}']`);/**/
    ok = (outp === inpPN.toString(10));
    /**/if (!ok) break;/**/
  };
  if (ok)   trace('............................... CONST')
  if (ok)   for (let [inp,outp] of [
      ['c_10'           /*{  a  * (~1~0~)            }            */,'(~1~,0~0~0~0~0~0~0~0~0~...~) * (~1~0~)^(1)']
    , ['c_P_TRAP'       /*{ 4*a * (~0.5~,-1~1~-1~...)}, a=1/h     */,'(~2~,-4~4~-4~4~-4~4~-4~4~-4~...~)']
    , ['c_05111'        /*{  a  * (~0.5~,1~1~1~... )}             */,'(~0.5~,1~1~1~1~1~1~1~1~1~...~)']
    , ['c_1111'         /*{  a  * (~1~,1~1~1~... )  }             */,'(~1~,1~1~1~1~1~1~1~1~1~...~)']
    , ['c_P_TRAP_PWR_2' /*{( 4*a * (~0.5~,-1~1~-1~...) )2}, a=1/h */,'(~4~,-16~32~-48~64~-80~96~-112~128~-144~...~)']
    ]) {
    let inpPN  = new PN(<PN_CONST>inp); 
    trace(`${inpPN.toStringNm(inp)}`); /** trace(`\t,'${inpPN.toString()}']`);/**/
    ok = (outp === inpPN.toString(10));
    /**/if (!ok) break;/**/
  };

  if (ok)   trace('............................... operations and fuctions')
  let a1 = new PN('c_05111');  ok && trace(pn.toStringNm('a1'));
  ok = ok && a1.toString(10) === '(~0.5~,1~1~1~1~1~1~1~1~1~...~)'
  
  let a2:PN = a1.add(a1); ok && trace(a2.toStringNm('a2'));
  ok = ok && a2.toString(10) === '(~1~,2~2~2~2~2~2~2~2~2~...~)'

  let s = JSON.stringify(a2.asList().slice(0,4)); ok && trace (`a2.asList(): ${s}...`); 
  ok = ok && s === '[1,2,2,2]';

  s = JSON.stringify(a2.asPointsList(0.5).slice(0,4)); ok && trace (`a2.asPointsList(0.5): ${s}...`); 
  ok = ok &&  s === '[[0,1],[0.5,2],[1,2],[1.5,2]]';

  let a3 = a2.mul(new PN('c_10', 10)); ok && trace(a3.toStringNm('a3'));
  ok = ok && a3.toString(10) === '(~10~,20~20~20~20~20~20~20~20~20~...~) * (~1~0~)^(1)'
  
  let a2_3 = a2.div(a3); ok && trace(a2_3.toStringNm('a2 / a3'));
  ok = ok && a2_3.toString(10) === '(~0.1~,0~0~0~0~0~0~0~0~0~...~) * (~1~0~)^(-1)'

  let p2 = a3.pow(2); ok && trace(p2.toStringNm('a3 ^ 2',6));
  ok = ok && p2.toString(6) === '(~100~,400~800~1200~1600~2000~...~) * (~1~0~)^(2)'

  p2 = p2.pow(0.5); ok && trace(p2.toStringNm('a3=(a3^2)^0.5',6));
  ok = ok && p2.toString(6) === '(~10~,20~20~20~20~19.999999999999982~...~) * (~1~0~)^(1)'

  p2 = a3.pow(2).pow(0.5); ok && trace(p2.toStringNm('a3=(a3^2)^0.5',6));
  ok = ok && p2.toString(6) === '(~10~,20~20~20~20~19.999999999999982~...~) * (~1~0~)^(1)'

  if (ok)   trace('............................... PN op number')
  let r1 = a3.add(100); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~10~,120~20~20~20~20~20~20~20~20~...~) * (~1~0~)^(1)'
  
  r1 = a3.sub(440); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~10~,-420~20~20~20~20~20~20~20~20~...~) * (~1~0~)^(1)'
  
  r1 = a3.mul(10); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~100~,200~200~200~200~200~200~200~200~200~...~) * (~1~0~)^(1)'

  r1 = a3.div(10); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~1~,2~2~2~2~2~2~2~2~2~...~) * (~1~0~)^(1)'
  
  r1 = (new PN('c_05111')).add(100); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~100.5~,1~1~1~1~1~1~1~1~1~...~)'

  r1 = (new PN('(~0~,0~3~)')).add(100); ok && trace(r1.toStringNm('r1'));
  ok = ok && r1.toString(10) === '(~100~,0~3~0~0~0~0~0~0~0~...~)'
  
  if (ok) {
    trace('    ok.')
    log = '====== ok. ======'+ log;
  } else {
    let s = '################## ERROR! ##################';
    trace(s);
    log = s + log;
  };
  //let c3x = new PN('err','err') //test it in js
  return log;
} //<- END for observablehq.com
)();