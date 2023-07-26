// Getting DOM elements
const addItemTemplate = document.querySelector('#create-item');
const saveItemButtonTemplate = document.querySelector('#save-item');
const allItemButtons = document.querySelectorAll('button');
const allSections = document.querySelectorAll('section');
const individualListTemplate = document.querySelector('#list');
const allSectionLists = document.querySelectorAll('.scroll-content ul');
// console.log(allSectionLists);

let idCountForEachList = 0;
let allListObjectsInfo = [];


// ADD/SAVE ITEM ------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------
let confirmAddTemplate = [];
let lastButtonChosenIndex;

// Recorremos todos los botones y les asignamos un evento
for (let i = 0; i < allItemButtons.length; i++) {
    const button = allItemButtons[i];
    confirmAddTemplate.push(true);
    allListObjectsInfo.push([]);
    button.addEventListener('click', renderAddItemContainer_SaveItemButton.bind(null, i));
}

function renderAddItemContainer_SaveItemButton(index){
    const addItemTemplateCopy = addItemTemplate.cloneNode(true).content;
    const saveItemButtonTemplateCopy = saveItemButtonTemplate.cloneNode(true).content;

    saveItemButtonTemplateCopy.querySelector('#save-item-button').addEventListener('click', () => {
        const itemTextInput = allSections[index].querySelector('#add-item-input').innerHTML;
        const itemTextInputWithCode = `${itemTextInput}<span contenteditable="false"><i class="fa-solid fa-xmark"></i></span>`;
      
        renderList(itemTextInputWithCode, index, idCountForEachList);

        const infoToSendToLocalStorage = {
            text: itemTextInputWithCode,
            sectionIndex: index,
            id: idCountForEachList
        };
        // Update ID counter
        ++idCountForEachList;

        allListObjectsInfo[index].push(infoToSendToLocalStorage);

        // LOCAL STORAGE when adding list 
        localStorage.setItem('lists', JSON.stringify(allListObjectsInfo));
    });

    /* Borrar el último contenedor en caso de que exista un número en la variable lastButtonChosenIndex y este NO sea igual al index actual.
    En caso de que sea igual al index actual se seguirá el siguiente if statement */
    if(typeof lastButtonChosenIndex === 'number' && lastButtonChosenIndex !== index){
        // Solo borrar el contenedor si existe y no ha sido eliminado por la siguiente condición
        if(allSections[lastButtonChosenIndex].querySelector('.desplazar-hacia-abajo')){
            allSections[lastButtonChosenIndex].querySelector('.desplazar-hacia-abajo').remove();
            confirmAddTemplate[lastButtonChosenIndex] = true;

            // Also delete save item button
            allSections[lastButtonChosenIndex].querySelector('#save-item-button').remove();
        }
    }

    // Si el contenedor NO existe
    if(confirmAddTemplate[index]){
        allSections[index].append(addItemTemplateCopy);
        lastButtonChosenIndex = index;
        confirmAddTemplate[index] = false;

        // Also render saveItem button
        allSections[index].querySelector('.buttons-container').append(saveItemButtonTemplateCopy);
    } else{
        // Si el contenedor YA existe
        allSections[index].querySelector('.desplazar-hacia-abajo').remove();
        confirmAddTemplate[index] = true;

        allSections[index].querySelector('#save-item-button').remove();
    }
}

function renderList(itemTextInput, indexToAppend, idList){
    const individualListTemplateCopy = individualListTemplate.cloneNode(true).content;
    const list = individualListTemplateCopy.querySelector('li');

    list.innerHTML = itemTextInput;
    list.id = idList;
    
    // The focusout event fires when an element has lost focus, after the blur event. The two events differ in that focusout bubbles, while blur does not.
    list.addEventListener('focusout', (e) => {

        for (let i = 0; i < allListObjectsInfo.length; i++) {
            const arrayList = allListObjectsInfo[i];

            // Getting DOM element list
            const getListToUpdateText = document.getElementById(`${e.target.id}`);
    
            // Recorremos el arreglo donde se encuentran los objetos con la info de cada lista
            for (let i = 0; i < arrayList.length; i++) {
                const list = arrayList[i];
    
                if(parseInt(e.target.id) === list.id){
                    list.text = getListToUpdateText.innerHTML;
    
                    // LOCAL STORAGE when modifying list
                    localStorage.setItem('lists', JSON.stringify(allListObjectsInfo)); 
                    break;
                }
            }
        }
    });

    // Delete list when clicked in xmark
    const xmark = list.querySelector('.fa-xmark');
    xmark.addEventListener('click', (e) => {

        // Recorremos el arreglo donde se encuentran los objetos con la info de cada lista
        for (let i = 0; i < allListObjectsInfo.length; i++) {
            const arrayList = allListObjectsInfo[i];
            
            for (let i = 0; i < arrayList.length; i++) {
                const list = arrayList[i];
                
                // Como el objetivo del evento es el xmark, conseguimos los padres hasta llegar a la lista y al id
                if(parseInt(e.target.parentElement.parentElement.id) === list.id){
                    arrayList.splice(i, 1);
    
                    console.log(' se eliminó del local');
                    // LOCAL STORAGE when modifying list
                    localStorage.setItem('lists', JSON.stringify(allListObjectsInfo)); 
                    break;
                }
            }
        }
        list.remove();
    });

    list.addEventListener('dragstart', (e) => {
        list.classList.add('dragging');
    });

    list.addEventListener('dragend', (e) => {
        list.classList.remove('dragging');

        // Remove background-color in section
        e.target.parentElement.parentElement.parentElement.style.removeProperty('background-color');
        
        const updateAllListObjectsInfo = [[],[],[],[]];
        // Update List in LOCAL STORAGE each time a drag event is completed
        // Loop in the DOM sections
        for (let sectIndex = 0; sectIndex < allSections.length; sectIndex++) {
            const section = allSections[sectIndex];
            
            const allListsSection = section.querySelector('ul').children;

            // Loop in the DOM li
            for (let individualLiIndex = 0; individualLiIndex < allListsSection.length; individualLiIndex++) {
                const individualList = allListsSection[individualLiIndex];
                const transformIdToNumber = parseInt(individualList.id);
                
                const infoToSendToLocalStorage = {
                    text: individualList.innerHTML,
                    sectionIndex: sectIndex,
                    id: transformIdToNumber
                };
                updateAllListObjectsInfo[sectIndex].push(infoToSendToLocalStorage);
            }
        }
        // SET LOCAL STORAGE
        allListObjectsInfo = updateAllListObjectsInfo;
        localStorage.setItem('lists', JSON.stringify(updateAllListObjectsInfo)); 
    });

    allSectionLists[indexToAppend].append(individualListTemplateCopy);
} 

const colorList = ['#ffc89b', '#93d6d6', '#8fdd8f', '#ffa098'];
for (let i = 0; i < allSections.length; i++) {
    const section = allSections[i];
    const listContainerDOM = section.querySelector('ul');

    section.addEventListener('dragover', (e) => {
        e.preventDefault();
        const getCurrentListDragged = document.querySelector('.dragging');
        
        if(e.currentTarget.id === section.id){
            listContainerDOM.appendChild(getCurrentListDragged);
            section.setAttribute('style', `background-color: ${colorList[i]}`);
        }
    });

    section.addEventListener('dragleave', () => {
        section.style.removeProperty('background-color');
    });
}


// Evento para quitar el addItemCointainer en caso de que se le de click a cualquier zona de la página menos al botón y al mismo contenedor
document.addEventListener('click', (e) => {
    if((e.target.tagName !== 'BUTTON') && (e.target.id !== 'add-item-input')){
        if(document.querySelector('.desplazar-hacia-abajo')){
            document.querySelector('.desplazar-hacia-abajo').remove();
            confirmAddTemplate[lastButtonChosenIndex] = true;

            // Also delete save item button
            document.querySelector('#save-item-button').remove();
        }
    }
});

/* La siguiente función nos ayuda a crear un salto de linea br en vez de un div cuando se de enter para seguir colocando texto. The keydown 
event is fired when a key is pressed.  */
document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      document.execCommand('insertLineBreak')
      event.preventDefault()
    }
})


// LOCAL STORAGE ------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------------------------------

if (!localStorage.getItem('lists')){
    // Local Storage
    localStorage.setItem('lists', JSON.stringify(allListObjectsInfo)); 
    
    idCountForEachList = 0;
    console.log(allListObjectsInfo, 'creación local storage');
    
} else if(localStorage.getItem('lists')){
    // Get scores from localStorage
    allListObjectsInfo = JSON.parse(localStorage.getItem('lists'));

    const allListIds = [];

    for (let sectionIndex = 0; sectionIndex < allListObjectsInfo.length; sectionIndex++) {
        const arrayWithObjects = allListObjectsInfo[sectionIndex];
        
        for (let objectIndex = 0; objectIndex < arrayWithObjects.length; objectIndex++) {
            const object = arrayWithObjects[objectIndex];
            
            allListIds.push(object.id);
            renderList(object.text, sectionIndex, object.id);
        }
    }

    // Update ListIds
    if(allListIds.length === 0){
        idCountForEachList = 0;
    } else{
        const highestListId = Math.max(...allListIds);
        idCountForEachList = highestListId + 1;
        console.log(allListIds);
    }
}
