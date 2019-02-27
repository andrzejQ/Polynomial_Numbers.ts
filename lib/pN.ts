/**
 * @author kubaszek
 * PN class with operations (as3 port to typescript)
 * http://www.pei.prz.edu.pl/%7Ekubaszek/index_en.html
 *
 * (~m_0 ~, m_1 ~ m_2 ~  ...~) · (~1~0~)^c               
 *   where: m - PN mantissa         c - PN exponent
 *
 * type argPNconstr = 
 *   PN //copy (deep copy if a !== 1) | number // mant[0] | number[] //mant (deep copy)
       | string // '(~...~)' or 'c_...' 
 * constructor(
 *   pn_arr_str_num: argPNconstr
 *  ,a: number = 1 // scale mant
 *  ,exponAdd: number = 0 //added to exponent
 * )
 *   type PN_CONST =
 *   | 'c_10'           //{  a  * (~1~0~)            }
 *   | 'c_05111'        //{  a  * (~0.5~, 1~1~1~... )}
 *   | 'c_1111'         //{  a  * (~1~, 1~1~1~... )  }
 *   | 'c_P_TRAP'       //{ 4*a * (~0.5~,-1~1~-1~...)}, a=1/h
 *   | 'c_P_TRAP_PWR_2' //{ ( 4*a * (~0.5~,-1~1~-1~...) )²  }, a=1/h
 *   ;
 * methods:
 * .pow(a):PN //               ()^a
 * .exp():PN //                exp()
 * .ln():PN //                 ln()
 * .mul(y: argPNconstr):PN //  ()*(y)
 * .div(y: argPNconstr):PN //  ()/(y)
 * .add(y: argPNconstr):PN //  ()+(y)
 * .sub(y: argPNconstr):PN //  ()-(y)
 * .fromString(pNstr :string, a :number=1) //"(~1~2.3~,-1~-2~)" , "(~1.2~,2.5~-0.3~)*(~1~0~)^(-2); a - scale
 * .toString(max_N_str = 10):string //
 * .toStringNm(nm:string, max_N_str = 10):string //'nm = (~...~)'
 * .asList(crop: boolean = true):number[] //
 * .asPointsList(h: number, t_offs:number=0, crop: boolean = true):number[][] // //[[x,y],...]
 */
let MAX_N:number | undefined; /** PN digits number 
 * - you can set it before start of calc. 
 * In observablehq.com set it as cell value (or remove from constructor).
 */
const enum pNconfig {
  CONST_max_N = 64 //PN digits number - default value - see pN constructor
}
// as3 function trace() is replaced with
// console.info("info"); console.error("error"); console.warn("warn");
// Any console....() can be removed with text postrocessor, as it is in comments:
//                      // /*con*/console.('...');/**/
//                      // - you can replace `/*con*/console.` by `/*con* console.`
type PN_CONST =            //PN constants:
 | 'c_10'             //{  a  * (~1~0~)            }
 | 'c_05111'        //{  a  * (~0.5~, 1~1~1~... )}
 | 'c_1111'         //{  a  * (~1~, 1~1~1~... )  }
 | 'c_P_TRAP'       //{ 4*a * (~0.5~,-1~1~-1~...)}, a=1/h
 | 'c_P_TRAP_PWR_2' //{ ( 4*a * (~0.5~,-1~1~-1~...) )²  }, a=1/h
 ;

type argPNconstr = PN | number | number[] | string;

class PN {
//static max_N:number = 64; //PN digits number - see CONST_max_N
public mant :number[] = null;//new Array();/*0..max_N-1*/
public expon :number = 0;/*integer*/
//used in toString() and toStringNm()
//public name :string;
public a_mul:number;
//static max_N_str:number = 10; // < max_N;  used in .toString

////////////////////////////////////////////////////////////////
constructor(
  pn_arr_str_num: argPNconstr /* if PN - copy (deep copy if a !== 1); if number[] - mant (deep copy); number -> mant[0]; string - '(~...~)' or 'c_...' */
  ,a: number = 1 /*scale mant*/
  ,exponAdd: number = 0 /*added to exponent*/
  ,CONST_max_N=(/**/MAX_N ||/**/pNconfig.CONST_max_N) 
){
  this.a_mul = a; //to scale PN str. in toString()
  /*con* console.info(`${JSON.stringify(pn_arr_str_num)}; a_mul = ${this.a_mul}`);/**/
  if (pn_arr_str_num instanceof PN) { 
    a === 1 ? this.mant = pn_arr_str_num.mant
      : this.mant = Array.from(pn_arr_str_num.mant, x => x*a); //deep copy of PN
    this.expon = pn_arr_str_num.expon + exponAdd;
  } else {
    this.expon = exponAdd;
    this.mant = []; this.mant.length = CONST_max_N; this.mant.fill(0); /*0..max_N-1*/
    if (typeof pn_arr_str_num === 'number') {
      this.mant[0] = a * pn_arr_str_num;
    } else if (Array.isArray(pn_arr_str_num)) { //deep copy
      this.mant = Array.from(pn_arr_str_num, x => x*a); 
      const z = this.mant.length; //extend it with zeros:
      this.mant.length = CONST_max_N; this.mant.fill(0, z);
    } else if (typeof pn_arr_str_num === 'string') {
      if (pn_arr_str_num.substr(0,2) === '(~') {
        this.fromString(pn_arr_str_num, a); 
        this.expon += exponAdd;
      } else {
        [ this.expon, this.mant ] = PN.ovr_constr(<PN_CONST>pn_arr_str_num, a, CONST_max_N);//pN.max_N);
        this.expon += exponAdd;
      }
    } else {
      let err=`Error: Arg of PN() constructor should be: PN | Array | string | number !!!`
          /*con*/console.error(err);/**/
          throw new Error(err);
    }
  } //else instanceof PN
  /*con* console.info(this.toStringNm(''+pn_arr_str_num));/**/
}//constructor()

private static ovr_constr(pN_oper :PN_CONST, a :number, pN__max_N :number ):[ number, number[] ]{
/**
 * return: expon:number, mant:[number]
 */
  let expon:number = 0;
  let mant:number[] = [];
  mant.length = pN__max_N; mant.fill(0); /*0..max_N-1*/

  const  pN_op_funct = { //used in constructor - instead of switch ( pN_oper ) {
    'c_10'      :function() { expon = 1; mant[0] = a; }, //{  a  * (~1~0~) }
    'c_05111'   :function() { mant[0] = a/2; mant.fill(a,1); }, //{  a  * (~0.5~, 1~1~1~... )}
    'c_1111'    :function() { mant.fill(a); }, //{  a  * (~1~, 1~1~1~... )  }
    'c_P_TRAP'  :function() { //{ 4*a * (~0.5~,-1~1~-1~...)  }, a=1/h
      mant[0] = 2*a ;// 2/h
      let j =  -4*a ;// -4/h
      for (let k = 0;  ++k < pN__max_N; ) { 
        mant[k] = j;
        j = -j;
      }
    },
    'c_P_TRAP_PWR_2'  :function() {//{ (4*a * (~0.5~,-1~1~-1~...))²  }, a=1/h
      mant[0] = 2*2*a*a ;// (2/h)²
      let j =  -4*4*a*a ;// -(4/h)²
      for (let k = 0;  ++k < pN__max_N; ) { 
        mant[k] = j*k;
        j = -j;
      }
    },
    'default' :function() { //not allowed
      let err=`Error: Ivalid PN operation: ${pN_oper}`
      /*con*/console.error(err);/**/
      throw new Error(err);
    },
  };
  //switch ( pN_oper ) {
  (pN_op_funct[pN_oper] || pN_op_funct['default'])();
  return [ expon, mant ];
} //ovr_constr()

//////////////////////////////////

public pow(a):PN {                                            // this ^ a   '()^a'
  let r = new PN([]); let pN__max_N = this.mant.length;
  let expon_p :number = this.expon * a;
  r.expon = Math.round(expon_p);
  // - only integers are aceptable as expon:
  if ( Math.abs( (r.expon - expon_p) ) > 0.000000001 ) {
    let err=`Error: in ()^a operation result exponent ${expon_p} is not an integer !!!`;
    /*con*/console.error(err);/**/
    throw new Error(err);
  }
  for (let k = pN__max_N; --k >= 0; ) r.mant[k] = 0;
  if ( this.mant[0] <= 0 ) {
    let err=`Error: {X^a} 1st digit of X:  ${this.mant[0]} < 0 !!!`
    /*con*/console.error(err);/**/
    throw new Error(err);
  }
  r.mant[0] = Math.pow(this.mant[0], a); //exp(a*ln(x[0]))
  a += 1;
  for (let k = 1; k < pN__max_N; ++k ) {
    for (let j = 1;  j <= k; ++j )
      r.mant[k] += this.mant[j] * r.mant[k-j] * (a*j/k -1);
    r.mant[k] /= this.mant[0];
  }
  return r;
} //pow(a)

public exp():PN {                                          // this.exp()   'exp()'
  let r = new PN([]); let pN__max_N = this.mant.length; let x0:number = 0;
  r.expon = this.expon;
  x0 = Math.exp(this.mant[0]);
  r.mant[0] = x0;
  for ( let k = 1; k < pN__max_N; ++k ) {
    r.mant[k] = this.mant[k] * x0;
    for (let j = 1;  j < k; ++j )
      r.mant[k] += this.mant[k-j] * r.mant[j] * (1-j/k);
  }
  return r;
}//exp()

public ln():PN {                                             // this.ln()   'ln()'
  let r = new PN([]); let pN__max_N = this.mant.length;
  r.mant[0] = Math.log(this.mant[0]);
  for ( let k = 1; k < pN__max_N; ++k ) {
    r.mant[k] = this.mant[k]
    for (let j = 1;  j < k; ++j )
      r.mant[k] -= this.mant[j] * r.mant[k-j] * (1-j/k);
    r.mant[k] /= this.mant[0];
  }
  return r;
}//ln()

public mul(y: argPNconstr):PN {                                          // ( x * y )   '*()()'
  let r = new PN([]); let pN__max_N = this.mant.length;
  if (typeof y === 'number') {
    r.expon = this.expon;
    for (let k = pN__max_N; k--; )
      r.mant[k] = this.mant[k] * y;
    return r;
  } //else
  y = new PN(y);
  r.expon = this.expon + y.expon ;
  for (let k = 0;  k < pN__max_N; ++k) {
    r.mant[k] = 0;
    for (let j = 0;  j <= k; ++j )
      r.mant[k] += this.mant[k-j] * y.mant[j];
  }
  return r;
} //mul(y)

public div(y: argPNconstr):PN {                                           // ( x / y )   '/()()'
  let r = new PN([]); let pN__max_N = this.mant.length;
  if (typeof y === 'number') {
    r.expon = this.expon;
    for (let k = pN__max_N; k--; )
      r.mant[k] = this.mant[k] / y;
    return r;
  } //else
  y = new PN(y);
  r.expon = this.expon - y.expon ;
  for (let k = 0;  k < pN__max_N; ++k) {
    r.mant[k] = this.mant[k];;
    for (let j = 0;  j < k; ++j )
      r.mant[k] -= y.mant[k-j] * r.mant[j];
    r.mant[k] *= 1 / y.mant[0];
  }
  return r;
} //div(y)


public add(y: argPNconstr):PN {                                          // ( x + y )   '+()()'
  return this.ADD_or_SUB(true, y); 
} //add(y)

public sub(y: argPNconstr):PN {                                          // ( x - y )   '-()()'
  return this.ADD_or_SUB(false, y); 
} //sub(y)

private ADD_or_SUB(pN_oper_ADD:boolean, y:argPNconstr):PN { //( x ± y )
  let r = new PN([]); 
  if (typeof y === 'number') {
    if (this.expon === 0) {//common case
      r.mant = Array.from(this.mant);
      pN_oper_ADD ? r.mant[0] += y : r.mant[0] -= y;
      return r;
    }
  }
  y = new PN(y);
  let pN__max_N = this.mant.length;
  let i:number, j:number, k:number;
  let xTmp:PN, yTmp:PN;
  if ( this.expon >= y.expon ) {
    xTmp=this, yTmp=y;
  } else {
    xTmp = y; yTmp = this;
  }      
  r.expon = xTmp.expon ;
  j = xTmp.expon - yTmp.expon ;
  for ( k = Math.min(j,pN__max_N); --k >= 0; )
    r.mant[k] = xTmp.mant[k];
    
  if ( pN_oper_ADD ) {
    for ( k = j; k < pN__max_N; ++k )
      r.mant[k] = ( xTmp.mant[k] + yTmp.mant[k-j] );
  } else {
    for ( k = j; k < pN__max_N; ++k )
      r.mant[k] = ( xTmp.mant[k] - yTmp.mant[k-j] );
  }      
  //normalization - mant[0] should not be zero (or almost 0... -not implemented)
  j = 0; while ( ( j < pN__max_N ) && ( r.mant[j] == 0 ) ) ++j;
  if ( j >= pN__max_N ) {//all pN digits are equal to zero:
    r.expon = 0;
  } else if ( j > 0 ) {//move digits
    for ( k = j; k < pN__max_N; ++k )
      r.mant[k-j] = r.mant[k];
    for ( k = pN__max_N-j; k < pN__max_N; ++k )
      r.mant[k] = 0;
          r.expon -= j;
    /*con*/console.warn("Warninig: During  "+
        (( pN_oper_ADD )?"[ + ]":"[ - ]")+" operation "+
        j+" significant PN digit(s) is(are) lost !!!"); /**/
  }
  return r;
}//private ADD_or_SUB(...)

//////////////////////////////////

public fromString(pNstr :string, a :number=1) {
/** string converted to PN value;
 *examples: "(~1~2.3~,-1~-2~)" , "(~1.2~,2.5~-0.3~)*(~1~0~)^(-2)"
 */
  this.expon = 0;
  const CONST_max_N_ = this.mant.length;
  this.mant = [];
  const re = /\(~(.+?)~\)(\s*\*\s*\(~1~0~\)\^(.+))?/;
  const pNcM = re.exec(pNstr); //console.log(pNcM);
  //ex.0:'(~1.2~,2.5~-0.3~)*(~1~0~)^(-2)'; 1:'1.2~,2.5~-0.3'; 3:'(-2)'
  if (pNcM) {
    this.expon = parseInt( (pNcM[3] || '').replace('(','') ) || 0; //console.log('this.expon:',this.expon); //-2
    let mantStr = pNcM[1]; //console.log('mantStr:',mantStr); //'1.2~,2.5~-0.3'
    //additional exponM from this.mant before '~,';  ==1 in '5.8~,...' case
    let exponM = 0; //',...' case
    const mantLStr = (mantStr+'~,').split(',')[0]; //console.log(mantLStr); //'1.2~'
    if (mantLStr){
      exponM = (mantLStr.split('~').length || 1) - 1;
    };  //console.log(exponM);//1
    this.expon += exponM - 1;
    this.mant = (mantStr.replace(',',''))
             .split('~') //console.log(this.mant);//[ '1.2', '2.5', '-0.3' ]
             .map(s => parseFloat(s) * a); // ..s) || 0 ); 
  }
  const z = this.mant.length; //extend it with zeros:
  this.mant.length = CONST_max_N_; this.mant.fill(0, z);
}//fromString

public toString(max_N_str = 10):string {
  let max_N_tmp = Math.min(max_N_str, this.mant.length);//(pN.max_N_str, pN.max_N);
  if (!max_N_tmp) return('(~??~)');
  let s = "";
  let mant_tmp = this.mant.slice(0,max_N_tmp);
  if ( this.a_mul != 1 ) {
    s += this.a_mul+ " * ";
    mant_tmp = mant_tmp.map(x => x/this.a_mul)
  }
  s += "(~" + mant_tmp[0] + "~," + mant_tmp.slice(1).join('~');
  if ( max_N_tmp < this.mant.length ) s += "~...";
  s += "~)";
  if ( this.expon != 0 ) s +=" * (~1~0~)^("+this.expon+")";
  return( s );
}//toString()
public toStringNm(nm:string, max_N_str = 10):string {
  return ( nm+" = "+this.toString(max_N_str) );
}//toStringNm
//////////////////////////////////
public asList(crop: boolean = true):number[] {
/** List normalized to exponent=0 - only if expon <= 0
 *  (!crop): result can be longer than this.mant.length
 */
  if (this.expon > 0) {
    let err=`Error: in asList() operation: exponent ${this.expon} > 0 !!!`;
    /*con*/console.error(err);/**/
    throw new Error(err);
  } else if (this.expon === 0) {
      return this.mant
  } else { //this.expon < 0  (TODO: should be tested)
    let mantE0:number[] = [];
    let ex = -this.expon;
    mantE0.length = ex; mantE0.fill(0);
    mantE0.concat(this.mant);
    if (crop) mantE0.length = this.mant.length;
    return mantE0;
  }
}//asList()
public asPointsList(h: number, t_offs:number=0, crop: boolean = true):number[][] { //[[x,y],...]
  return this.asList(crop).map( (y,i)=>[i*h + t_offs, y] );
}

} //PN class

