
  (function(){
    const board = document.getElementById('board');

    for(let r=9;r>=0;r--){
      const leftToRight = ((9-r)%2===0);
      if(leftToRight){
        for(let c=0;c<10;c++){
          const n=r*10+c+1;
          createCell(n,r,c);
        }
      } else {
        for(let c=9;c>=0;c--){
          const n=r*10+(9-c)+1;
          createCell(n,r,c);
        }
      }
    }

    function createCell(n,r,c){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.cell = n;
      cell.dataset.row = r;
      cell.dataset.col = c;

      const lbl = document.createElement('div');
      lbl.className = 'cell-label';
      lbl.textContent = n;
      cell.appendChild(lbl);

    
      const tokens = document.createElement('div');
      tokens.className = 'tokens';
      cell.appendChild(tokens);

      board.appendChild(cell);
    }

    
    function createToken(id, cls, text){
      const t = document.createElement('div');
      t.id = id;
      t.className = 'token '+cls;
      t.textContent = text;
      return t;
    }

   
    const P2 = createToken('p2','p2','2');
    const P1 = createToken('p1','p1','1');
   
    function appendTokenTo(cellNumber, tokenEl){
      const cell = board.querySelector(`[data-cell='${cellNumber}']`);
      if(!cell) return;
      const tokens = cell.querySelector('.tokens');
      tokens.appendChild(tokenEl);
    
      tokenEl.classList.add('pop');
      setTimeout(()=>{ tokenEl.classList.remove('pop'); }, 220);
    }

  
    appendTokenTo(1, P2);
    appendTokenTo(1, P1);
    
    const jumps = {
      2:32, 14:44, 33:63, 27:57, 
      24:5, 75:36, 89:30, 52:13
    };

    
    let state = { p1:1, p2:1 };
    let turn = 1;
    const turnBox = document.getElementById('turnBox');
    const diceFace = document.getElementById('diceFace');
    const rollBtn = document.getElementById('rollBtn');
    const resetBtn = document.getElementById('resetBtn');

    function updateTurnBox(){
      turnBox.textContent = `Player ${turn}'s Turn`;
     if(turn==1) {rollBtn.style.backgroundColor='#ff6b6b';rollBtn.style.color=`#000`;turnBox.style.color=`#ff6b6b`}
     else {rollBtn.style.backgroundColor='#4ecdc4';turnBox.style.color=`#4ecdc4`}
    }
    updateTurnBox();

    
    let busy = false;

    
    function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }

    function movePlayerTo(key, cellNumber) {
      return new Promise(resolve => {
    
        const tokenEl = key === 'p1' ? document.getElementById('p1') : document.getElementById('p2');
        let cell = state[key];
        const isLadder = jumps.hasOwnProperty(cellNumber);
    
        // STEP 1: move to cellNumber
        const interval1 = setInterval(() => {
          appendTokenTo(cell, tokenEl);
    
          if (cell === cellNumber) {
            clearInterval(interval1);
    
            if (!isLadder) {
              state[key] = cellNumber;
              return resolve();
            }
    
            // STEP 2: ladder climb
            let climb = cellNumber;
            let end = jumps[cellNumber];
    
            const interval2 = setInterval(() => {
             // appendTokenTo(climb, tokenEl);
    
              if (climb === end) {
                appendTokenTo(climb, tokenEl);
                clearInterval(interval2);
                state[key] = end;
                return resolve();
              }
    
              climb += climb < end ? 1 : -1;
    
            }, 0);
    
            return;
          }
    
          cell++;
    
        }, 350);
    
      });
    }
    

    // check for overlapping tokens styling: tokens container handles layout, no extra needed
    function checkWin(key){
      if(state[key] >= 100){
        setTimeout(()=> alert(`Player ${ key==='p1'?1:2 } wins!`), 50);
        appendTokenTo(1, P2);
        appendTokenTo(1, P1);
        rollBtn.disabled = true;
      }
    }

    // main move flow: animate steps (optional) - here we just teleport with small pop + check jumps
    async function playMove(dice){
      if(busy) return;
      busy = true;
      rollBtn.classList.add('disabled');
      rollBtn.disabled = true;

      const key = (turn===1)? 'p1' : 'p2';
      const tokenEl = (key==='p1')? P1 : P2;

      // compute new pos
      let target = state[key] + dice;
      if(target > 100) target = 100;

      // move token (append into cell)
      await  movePlayerTo(key, target);
      await wait(260);

     
      checkWin(key);

    
      turn = turn===1?2:1;
      updateTurnBox();

      // re-enable
      rollBtn.classList.remove('disabled');
      rollBtn.disabled = false;
      busy = false;
    }

    // dice animation & hook
    rollBtn.addEventListener('click', async ()=>{
      if(busy) return;
      diceFace.textContent = '...';
      let last = 1;
      let rolls = 8;
      const it = setInterval(()=>{
        last = Math.floor(Math.random()*6)+1;
        diceFace.textContent = last;
        if(--rolls<=0) clearInterval(it);
      },80);

      await wait(80*9); // wait until dice animation ends

      // play move using final dice result (last)
      await playMove(last);
    });

    // reset
    resetBtn.addEventListener('click', ()=>{
   
      for(let n=1;n<=100;n++){
        const c = board.querySelector(`[data-cell='${n}']`);
        if(c) {
          const tokens = c.querySelector('.tokens');
          tokens.innerHTML = '';
        }
      }
      state = { p1:1, p2:1 };
      appendTokenTo(1, P1);
      appendTokenTo(1, P2);
      turn = 1;
      updateTurnBox();
      diceFace.textContent = '—';
      rollBtn.disabled = false;
    });

    
    window.addEventListener('resize', ()=>{ /* nothing needed; tokens are inside cells */ });

  })();
  