let content = document.getElementById('ajax-content')

function fetchContent(el){
    
    let view = el.getAttribute('a-view') // pega elemento a-view
    //let folder = el.getAttribute('a-folder')//pega elemento a-folder
    //fetch(`/ajax/${folder}/${view}.html`) //passo o caminho até o arquivo.
    fetch(`${view}`)
    .then(response =>{
        let html = response.text()
        console.log(html)
        return html;
    }).then(html =>{
        console.log(html)
        content.innerHTML = html
    })
}