document.querySelectorAll(".card").forEach(card=>{

card.addEventListener("click",()=>{

let width = card.dataset.width;

console.log("Выбран гараж:",width,"метров");

});

});
