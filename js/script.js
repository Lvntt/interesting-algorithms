function showTab(tabId) {
    let tabs = document.querySelectorAll('.tabContent')
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }

    document.getElementById(tabId).style.display = 'block';
}

let links = document.querySelectorAll('.sidebarLink')
for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function(e) {
        e.preventDefault();
        showTab(this.getAttribute('data-tab'));
        for (let i = 0; i < links.length; i++) {
            links[i].classList.remove('active');
        }
        links[i].classList.add('active');
    });
}