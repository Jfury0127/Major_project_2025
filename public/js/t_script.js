const mini_sb = document.querySelector("#mini_sb");  //< button
const sbLinks = document.querySelectorAll(".sb-item");
const sb = document.querySelector(".sidebar");
const mainsec = document.querySelector(".main-sec");
const menu = document.querySelector(".menu");

//minimize sidebar
mini_sb.addEventListener('click', () => {
    sbLinks.forEach(link => {
        link.classList.toggle("hidden");  //hide links

    });

    //minimize sidebar
    if (sb.classList.contains("w-60")) {
        sb.classList.remove("w-60");
        sb.classList.add("w-24");
    } else {
        sb.classList.remove("w-24");
        sb.classList.add("w-60");
    }         
    //shift main sec
    if (mainsec.classList.contains("sm:ml-60")) {
        mainsec.classList.remove("sm:ml-60");
        mainsec.classList.add("sm:ml-24");
    } else {
        mainsec.classList.remove("sm:ml-24");
        mainsec.classList.add("sm:ml-60");
    } 

    mini_sb.classList.toggle("rotate-180");
});

menu.addEventListener('click',()=>{
    mainsec.classList.toggle("hidden")
    sb.classList.toggle("hidden")
    sb.classList.toggle("w-full")
    mini_sb.classList.toggle("!hidden")
    
})

function openPage(url) {
    window.location.href = url;  // Redirects to the specified URL
}
    