import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let laodInterval;

// loader
const loader = (element) => {
  element.textContent = '';

  laodInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
};

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

// method to generate unique id
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexString = randomNumber.toString(16);

  return `id-${timestamp}-${hexString}`;
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
      <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
};

const submitHandler = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  //bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server
  const response = await fetch('https://codex-hake.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(laodInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong.';

    alert(err);
  }
};

form.addEventListener('submit', submitHandler);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    submitHandler(e);
  }
});
