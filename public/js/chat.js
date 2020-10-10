const socket = io();

const $messages = document.querySelector("#messages");
const $messageForm = document.querySelector("#messageForm");
const $messageInput = document.querySelector("#messageInput");
const $sendMessageBtn = document.querySelector("#sendMessageBtn");
const $geoLocationBtn = document.querySelector("#shareLocation");
const $sidebar = document.querySelector("#sidebar");
const $scrollToBottomBtn = document.querySelector("#scrollToBottom");
$scrollToBottomBtn.style.display = "none";

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const roomUserListTemplate = document.querySelector("#sidebar-template")
  .innerHTML;

// OPTIONS
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

$messages.addEventListener("scroll", (event) => {
  if ($messages.scrollHeight - $messages.scrollTop !== $messages.clientHeight) {
    $scrollToBottomBtn.style.display = "block";
  } else {
    $scrollToBottomBtn.style.display = "none";
  }
});

$scrollToBottomBtn.addEventListener("click", (event) => {
  event.preventDefault();
  scrollToBottom($messages);
});

const scrollToBottom = (window) => {
  window.scrollTop = window.scrollHeight;
};

scrollToBottom($messages);

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("H:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  scrollToBottom($messages);
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.text,
    createdAt: moment(message.createdAt).format("H:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(roomUserListTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (messageInput.value == "") {
    return alert("message can't be empty..");
  }

  $sendMessageBtn.setAttribute("disabled", "disabled");
  let $message = event.target.elements.message.value;

  socket.emit("sendMessage", $message, (error) => {
    $sendMessageBtn.removeAttribute("disabled");
    $messageInput.value = "";
    messageInput.focus();

    if (error) {
      return console.log(error);
    }
  });
});

$geoLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not support by your browser");
  }
  $geoLocationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "shareLocation",
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      },
      () => {
        $geoLocationBtn.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
