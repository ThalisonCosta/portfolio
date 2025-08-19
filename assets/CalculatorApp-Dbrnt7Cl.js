import{r as a,j as n}from"./index-CgCM4PKA.js";const R=()=>{const[u,o]=a.useState({display:"0",previousValue:null,operation:null,waitingForOperand:!1,isResult:!1,history:""}),l=a.useCallback(t=>{o(e=>{const{display:i,waitingForOperand:r,isResult:c}=e;return r||c?{...e,display:t,waitingForOperand:!1,isResult:!1}:{...e,display:i==="0"?t:`${i}${t}`,isResult:!1}})},[]),p=a.useCallback(()=>{o(t=>{const{display:e,waitingForOperand:i,isResult:r}=t;return i||r?{...t,display:"0.",waitingForOperand:!1,isResult:!1}:e.indexOf(".")===-1?{...t,display:`${e}.`,isResult:!1}:t})},[]),f=a.useCallback(()=>{o(t=>({...t,display:"0"}))},[]),m=a.useCallback(()=>{o(t=>{const{display:e,isResult:i}=t;return i?{...t,display:"0",isResult:!1}:e.length>1&&e!=="0"?{...t,display:e.slice(0,-1)}:{...t,display:"0"}})},[]),h=a.useCallback(()=>{o({display:"0",previousValue:null,operation:null,waitingForOperand:!1,isResult:!1,history:""})},[]),d=a.useCallback((t,e,i)=>{switch(i){case"+":return t+e;case"-":return t-e;case"×":return t*e;case"÷":if(e===0)throw new Error("Cannot divide by zero");return t/e;default:return e}},[]),s=a.useCallback(t=>{o(e=>{const{display:i,previousValue:r,operation:c,waitingForOperand:x,history:k}=e,b=parseFloat(i);if(r===null)return{...e,previousValue:b,operation:t,waitingForOperand:!0,history:`${i} ${t}`};if(c&&x)return{...e,operation:t,history:k.slice(0,-1)+t};try{const C=d(r,b,c||"+"),N=Number(C.toPrecision(12)).toString();return{...e,display:N,previousValue:C,operation:t,waitingForOperand:!0,isResult:!1,history:`${N} ${t}`}}catch{return{...e,display:"Error",previousValue:null,operation:null,waitingForOperand:!0,isResult:!0,history:""}}})},[d]),g=a.useCallback(()=>{o(t=>{const{display:e,previousValue:i,operation:r,history:c}=t,x=parseFloat(e);if(i!==null&&r)try{const k=d(i,x,r),b=Number(k.toPrecision(12)).toString();return{...t,display:b,previousValue:null,operation:null,waitingForOperand:!0,isResult:!0,history:`${c} ${e} =`}}catch{return{...t,display:"Error",previousValue:null,operation:null,waitingForOperand:!0,isResult:!0,history:""}}return t})},[d]),w=a.useCallback(()=>{o(t=>{const{display:e}=t,r=parseFloat(e)/100,c=Number(r.toPrecision(12)).toString();return{...t,display:c,isResult:!0}})},[]),y=a.useCallback(t=>{t.preventDefault(),t.key>="0"&&t.key<="9"?l(t.key):t.key==="."?p():t.key==="+"?s("+"):t.key==="-"?s("-"):t.key==="*"?s("×"):t.key==="/"?s("÷"):t.key==="Enter"||t.key==="="?g():t.key==="%"?w():t.key==="Escape"?h():t.key==="Backspace"?m():t.key==="Delete"&&f()},[l,p,s,g,w,h,f,m]);a.useEffect(()=>(document.addEventListener("keydown",y),()=>{document.removeEventListener("keydown",y)}),[y]);const j=t=>{if(t==="Error")return t;const e=parseFloat(t);return isNaN(e)?"0":Math.abs(e)>=1e15||Math.abs(e)<1e-10&&e!==0?e.toExponential(5):t};return n.jsxs("div",{className:"calculator-app",children:[n.jsxs("div",{className:"calculator",children:[n.jsxs("div",{className:"calculator-display",children:[n.jsx("div",{className:"history-display",title:u.history,children:u.history||" "}),n.jsx("div",{className:"display-value",title:u.display,children:j(u.display)})]}),n.jsxs("div",{className:"calculator-buttons",children:[n.jsx("button",{className:"btn btn-function",onClick:h,title:"Clear All (Escape)",children:"AC"}),n.jsx("button",{className:"btn btn-function",onClick:f,title:"Clear Entry (Delete)",children:"C"}),n.jsx("button",{className:"btn btn-function",onClick:m,title:"Backspace",children:"⌫"}),n.jsx("button",{className:"btn btn-operation",onClick:()=>s("÷"),title:"Divide (/)",children:"÷"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("7"),title:"7",children:"7"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("8"),title:"8",children:"8"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("9"),title:"9",children:"9"}),n.jsx("button",{className:"btn btn-operation",onClick:()=>s("×"),title:"Multiply (*)",children:"×"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("4"),title:"4",children:"4"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("5"),title:"5",children:"5"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("6"),title:"6",children:"6"}),n.jsx("button",{className:"btn btn-operation",onClick:()=>s("-"),title:"Subtract (-)",children:"-"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("1"),title:"1",children:"1"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("2"),title:"2",children:"2"}),n.jsx("button",{className:"btn btn-number",onClick:()=>l("3"),title:"3",children:"3"}),n.jsx("button",{className:"btn btn-operation",onClick:()=>s("+"),title:"Add (+)",children:"+"}),n.jsx("button",{className:"btn btn-number btn-zero",onClick:()=>l("0"),title:"0",children:"0"}),n.jsx("button",{className:"btn btn-number",onClick:p,title:"Decimal point (.)",children:"."}),n.jsx("button",{className:"btn btn-equals",onClick:g,title:"Equals (Enter)",children:"="})]})]}),n.jsx("style",{children:`
        .calculator-app {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #2d3748;
        }

        .calculator {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #2d3748;
          padding: 12px;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }

        .calculator-display {
          background: #1a202c;
          border-radius: 8px;
          padding: 16px 12px;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .history-display {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          color: #a0aec0;
          text-align: right;
          min-height: 1.1em;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .display-value {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 2.2rem;
          font-weight: 300;
          color: white;
          text-align: right;
          min-height: 1.1em;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.1;
        }

        .calculator-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          flex: 1;
        }

        .btn {
          height: 56px;
          border: none;
          border-radius: 8px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          position: relative;
          overflow: hidden;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-number {
          background: #4a5568;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-number:hover {
          background: #5a6578;
        }

        .btn-operation {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 700;
        }

        .btn-operation:hover {
          background: linear-gradient(135deg, #7c93f0 0%, #8659b8 100%);
        }

        .btn-function {
          background: linear-gradient(135deg, #fd746c 0%, #ff9068 100%);
          color: white;
          font-weight: 700;
        }

        .btn-function:hover {
          background: linear-gradient(135deg, #fd8680 0%, #ff9e7c 100%);
        }

        .btn-equals {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          font-weight: 700;
        }

        .btn-equals:hover {
          background: linear-gradient(135deg, #1ba89c 0%, #4af48b 100%);
        }

        .btn-zero {
          grid-column: span 2;
        }

        @media (max-width: 480px) {
          .calculator {
            padding: 8px;
          }

          .calculator-display {
            padding: 12px 8px;
            margin-bottom: 8px;
          }

          .history-display {
            font-size: 0.8rem;
            margin-bottom: 4px;
          }

          .display-value {
            font-size: 1.8rem;
          }

          .btn {
            height: 44px;
            font-size: 1rem;
          }

          .calculator-buttons {
            gap: 6px;
          }
        }

        @media (max-width: 360px) {
          .calculator {
            padding: 6px;
          }

          .calculator-display {
            padding: 10px 6px;
            margin-bottom: 6px;
          }

          .display-value {
            font-size: 1.6rem;
          }

          .btn {
            height: 40px;
            font-size: 0.9rem;
          }

          .calculator-buttons {
            gap: 4px;
          }
        }
      `})]})};export{R as CalculatorApp};
