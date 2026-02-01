console.log(`==== WIP ====`)

const Roomform = document.getElementById("RoomForm");
const nameInp = document.getElementById("name");
const typeSel = document.getElementById("type");

const userIcon = document.getElementById("userIcon");

// Config
const HOST = "localhost:5000"

fetch("/api/verify-login", {
  credentials: "include"
})
.then(r => r.json())
.then(r => {
  if(r.loggedIn === true) {}
    // logged in
  else {
    location.href = `http://${HOST}/register`
  }
});
// =================
//        WIP       
// ==================

async function CreateRoom(ownerId,name, stack) {
  const res = await fetch("http://localhost:3000/api/createRoom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })

}

Roomform.addEventListener('submit',(e) => {
  e.preventDefault();

  const name = nameInp.value
  const type = typeSel.value

  
});

userIcon.addEventListener('click',() =>{
  document.location.href = `http://${HOST}/register`;
});