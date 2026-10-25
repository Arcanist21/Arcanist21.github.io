
class Task{
  text=undefined;
  date="";
  done=false;
  constructor(text,date=undefined) {
    if(date!=undefined){
      this.date=date;
    }
    if(text!=undefined) {
      this.text = text;
    }
  }
}
class Todo{
  #tasks=[]
  save() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
  }
  load() {
    this.#tasks = JSON.parse(localStorage.getItem('tasks') ?? '[]');
    this.draw();
  }
  draw(){
    this.save();
    let search_bar = document.querySelector("#szukaj");
    let ul=document.querySelector(".lista_taskow > ul");
    ul.replaceChildren();
    for( const [ index, item] of this.#tasks.entries()) {
      if(search_bar.value.length >=2 &&  !item.text.toLowerCase().includes(search_bar.value.toLowerCase()))
      {
        continue;
      }
      let li=this.createLi(item,index);
      li.addEventListener('click',(e)=>{
        if(e.target.closest('input, button')) return;
        this.convertToEdit(li,item,index);
      });
      ul.append(li);
    }
  }
  addTask(text,date){
    this.#tasks.push(new Task(text,date));
    this.draw();
  }
  removeTask(index){
    this.#tasks.splice(index,1);
    this.draw();
  }
  createLi(item,index) {
    let li = document.createElement('li');

    /* kod checkboxa wzięty z claude*/
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done ?? false;
    cb.addEventListener('change', () => {
      item.done = cb.checked;
      this.save();
    });
    //dotąd

    //kod markowania generowany claude
    let text = document.createElement('p');
    const query = document.querySelector("#szukaj").value;
    const pos = query.length >= 2
      ? item.text.toLowerCase().indexOf(query.toLowerCase())
      : -1;
    if (pos === -1) {
      text.textContent = item.text;
    } else {
      const mark = document.createElement('mark');
      mark.textContent = item.text.slice(pos, pos + query.length);
      text.append(
        item.text.slice(0, pos),
        mark,
        item.text.slice(pos + query.length)
      );
    }
    //dotąd

    let date = document.createElement('p')
    date.textContent = item.date ? `${item.date}` : "";

    let button = document.createElement('button');
    button.textContent = 'Usuń';
    button.addEventListener('click', () => {
      this.removeTask(index)
    })
    li.append(cb, text, date, button);
    return li;

  }
  //funkcje walidacyjne generowane claude
  validateText(text) {
    const t = (text ?? '').trim();
    return t.length >= 3 && t.length <= 255;
  }

  validateDate(text) {
    if (!text) return true;
    try {
      const d = Temporal.PlainDate.from(text);
      return Temporal.PlainDate.compare(d, Temporal.Now.plainDateISO()) >= 0;
    } catch {
      return false;
    }
  }

   convertToEdit(originalLi,item,index){
    let form= document.querySelector(".panel_dodania");
    //claude podpowiedział cloneNode
    let copied_form=form.cloneNode(true);
    //skopiowane z sekcji poniżej i edytowane
    copied_form.elements['nazwa-zadania'].value = item.text;
    copied_form.elements['data-zadania'].value = item.date;
    copied_form.addEventListener('submit', (e) => {
      e.preventDefault();
      const dane = new FormData(copied_form);
      const nazwa = dane.get('nazwa-zadania');

      const data = dane.get('data-zadania');

      item.text=nazwa;
      item.date=data;
      this.draw();
    });
     let button = document.createElement('button');
     button.textContent = 'Usuń';
     button.addEventListener('click', () => {
       this.removeTask(index)
     })

     let li=document.createElement('li');
     li.append(copied_form,button);
     li.classList.add('form-li');
     //podejście do focusout zaproponowane przez claude
     li.tabIndex = -1;

    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget)) {
        const form_data = new FormData(copied_form);

        if(this.validateDate(form_data.get("data-zadania"))){
          item.date=form_data.get("data-zadania");
        }
        if(this.validateText(form_data.get("nazwa-zadania"))){
          item.text=form_data.get("nazwa-zadania");
        }
        this.draw();
      }
    });
    originalLi.replaceWith(li);
    // dodane przez copilot
    copied_form.elements['nazwa-zadania'].focus();
  }
}

let form= document.querySelector(".panel_dodania");

let form_data_input =  form.elements['data-zadania'];

form_data_input.min=Temporal.Now.plainDateISO().toString();


let Lista=new Todo;
Lista.load();

let search_bar=document.querySelector("#szukaj");
search_bar.addEventListener('input',() => Lista.draw());
//obsługa forma napisana przez claude
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dane = new FormData(form);
  const nazwa = dane.get('nazwa-zadania');
  const data = dane.get('data-zadania');
  Lista.addTask(nazwa,data);
  form.reset();
});



