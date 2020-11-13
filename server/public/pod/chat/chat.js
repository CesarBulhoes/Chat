let socket = io();

let name = '', ip = '',
  chat = document.querySelector('.chat'),
  info = document.querySelector('.info'),
  enter = document.querySelector('#enter'),
  modal = document.querySelector('#modal'),
  messenger = document.querySelector('#messenger'),
  icon = document.querySelector('.chat-icon'),
  ul = document.querySelector('.msg_card_body'),
  minimize = document.querySelector('.minimize'),
  options = document.querySelector('.options'),
  exclude = document.querySelector('.options > span.exclude'),
  formRegister = document.querySelector('form[name="register"]'),
  formMessage = document.querySelector('form[name="message"]')
  sendImageAvailable = true,
  lastSender = '',
  minimized = true;

/* menuOptions > saves elementId to object Options 
and shows it at the right position. */

function menuOptions(event, element) {

  event.stopPropagation();
  options.elementId = element.parentElement.parentElement.parentElement.id;
  options.classList.remove("hide");
  options.style.left = (event.clientX - options.offsetWidth) + "px";
  options.style.top = event.clientY + "px";
}

/* shadowbox > Show a modal at the top of all elements 
to show images amplified sent through the chat . */

function shadowbox(el) {
  new ShadowBox().show({
    content: `<img src=${el.src}  width="100%" height="100%" style="object-fit: cover;">`,
    className: 'imageBox'
    // interactable: false
  });
}

/* It sends information that 
the user is typing, or not, a message. */

messenger.addEventListener("keyup", function () {
  if (!this.value) {
    socket.emit('stopTyping')
  }else{
    socket.emit('typing')
  }
});

/* It allows minimize or maximize 
chat by using the keyboard. */

minimize.onkeyup = (event) => {
  if (event.code == "Space" || event.code == "Enter") {
    minimized = !minimized;
    if (minimized) {
      chat.classList.add('minimized');
    } else {
      icon.classList.remove("alert");
      chat.classList.remove('minimized');
    }
  }
};

/* It allows minimize or maximize 
chat by using the mouse. */

minimize.onclick = (event) => {
  event.stopPropagation();
  minimized = !minimized;
  if (minimized) {
    chat.classList.add('minimized');
  } else {
    icon.classList.remove("alert");
    chat.classList.remove('minimized');
  }
};

/* It allows hiding Options object
by not clicking the object it directly. */

window.onclick = () => {
  options.classList.add("hide");
}

/* It avoids hiding Options object
by clicking it directly. */

options.onclick = () => {
  event.stopPropagation();
}

/* It allows senging requisition to
remove specific message. Only possible if
the sender owns the message. */

exclude.onclick = function (event) {
  event.stopPropagation();
  let target = Array.prototype.slice.call(document.querySelectorAll('li>section>span>.msg_content')).find(el => el.parentElement.parentElement.parentElement.id == this.parentElement.elementId);
  socket.emit('delMessage', { id: this.parentElement.elementId, source: target.parentElement.parentElement.id });
  options.classList.add("hide");
}

/* It allows receiving requisition to
remove specific message. */

socket.on('delMessage', async function (response) {

  let target = Array.prototype.slice.call(document.querySelectorAll('li>section>span>.msg_content')).find(el => el.parentElement.parentElement.parentElement.id == response.id);
  target.parentElement.parentElement.style.backgroundColor = '#AAAFBF';
  target.parentElement.parentElement.children[0].children[0].style.display = 'none';
  target.textContent = `Mensagem apagada.`;

});


/* It allows receiving the username
and sending requisition to add user 
to specific chat room. */

formRegister.onsubmit = (event) => {

  event.preventDefault();
  name = document.querySelector('#name').value;
  modal.style = 'display: none';
  socket.emit('room', { token: window.location.pathname.split('/').pop(), username: name });

  return false;
};

/* It allows sending text messages. */

formMessage.onsubmit = (event) => {
  event.preventDefault();

  if (messenger.value.trim()) {

    socket.emit('message', { text: messenger.value });

    messenger.value = '';
  }
  return false;
};

/* It allows sending image messages on paste event. */

messenger.onpaste = function () {

  let items = (event.clipboardData || event.originalEvent.clipboardData).items;
  let blob = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") === 0) {
      blob = items[i].getAsFile();
    }
  }
  if (blob !== null) {
    let reader = new FileReader();
    reader.onload = function (event) {

      if (sendImageAvailable) {
        sendImageAvailable = false;

        socket.emit('image', { img: event.target.result });

        setInterval(() => {
          available = true;
        }, 5000);
      }
    };
    reader.readAsDataURL(blob);
  }
};

/* It allows receiving text or image messages 
and add them to the chat. */

socket.on('chat', function (response) {

  if (response.source == socket.id) {

    ul.insertAdjacentHTML('beforeend',
      `<li id="${response.id}" ${(lastSender == response.source ? 'style="margin-top: 3px;"' : 'style="margin-top: 10px;"')}>
        <section class="msg_cotainer_send" id="${response.source}">
          <span>
            <span class="menu material-icons" onclick="menuOptions(event, this)">keyboard_arrow_down</span>
            <span class="msg_time">${response.time}</span>
          </span>
          <span>
            <span class="msg_content" >${(response.type == 'text' ? response.text : `<img onclick="shadowbox(this)" src=${response.img} width="100" height="auto">`)}</span>
          </span>
        </section>
      </li>`);


  } else {

    if (!document.querySelectorAll('ul li').length) { response.show = true; }

    ul.insertAdjacentHTML('beforeend',
      `<li id="${response.id}" ${(lastSender == response.source ? 'style="margin-top: 3px;"' : 'style="margin-top: 10px;"')}>
        <section class="msg_cotainer">
          <span>
            <span class="username">${response.show ? response.username : ''}</span>
            <span class="menu material-icons" onclick="menuOptions(event, this)">keyboard_arrow_down</span>
            <span class="msg_time">${response.time}</span>
          </span>
          <span>
            <span class="msg_content" >${(response.type == 'text' ? response.text : `<img onclick="shadowbox(this)" src=${response.img} width="100" height="auto">`)}</span>
          </span>
        </section>
      </li>`);

    /* If chat is minimized and user receive a message
    then the chat icon will start alerting. */

    if (minimized) {
      icon.classList.add("alert");
    }
  }

   /* When you receive an image that you sent
   then you will be able to sent a new image. */

  if (response.source == socket.id && response.type == 'image') {
    sendImageAvailable = true;
  }

  /* Scrolls chat when receiving new messages. */

  let last = ul.lastChild;
  let wholeHeight = last.offsetTop - ul.firstChild.offsetTop
    + last.offsetHeight
    + parseFloat(getComputedStyle(ul).paddingTop)
    + parseFloat(getComputedStyle(ul).paddingBottom);

  ul.scrollTop = (ul.scrollTop + wholeHeight);

  /* Saves the lastSender to verify 
  the spaces between messages. */

  lastSender = response.source;
});

/* It allows receiving information 
about new users joining the chat room. */

socket.on('joined', function (response) {

  if (response.source != socket.id) {

    ul.insertAdjacentHTML('beforeend',
      `<li>
        <section class="msg_cotainer_warning">
          <span class="username">${response.username}</span>
          <span class="msg_content"> Entrou na sala.</span>
          <span class="msg_time">${response.time}</span>
        </section>
      </li>`);

    ul.scrollTop = (ul.scrollTop + 100);
  }

});

/* It allows receiving information 
about users leaving the chat room. */

socket.on('disconnected', function (response) {

  if (response.source != socket.id) {

    ul.insertAdjacentHTML('beforeend',
      `<li>
        <section class="msg_cotainer_warning">
          <span class="username">${response.username}</span>
          <span class="msg_content"> Saiu da sala.</span>
          <span class="msg_time">${response.time}</span>
        </section>
      </li>`);

    ul.scrollTop = (ul.scrollTop + 100);
  }
});

/* It allows receiving information 
about if user stopped typing. */

socket.on('stopTyping', function (response) {

  if (response.source != socket.id) {
    info.innerText = ``;
  }
});

/* It allows receiving information 
about if user is typing. */

socket.on('typing', function (response) {

  if (response.source != socket.id) {
    info.innerText = `${response.username} está digitando...`;
  }
});