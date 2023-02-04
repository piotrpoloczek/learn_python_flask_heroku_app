
window.onload = () => {
  const table = document.querySelector('#data-table>tbody');
  const planetHeaders = ['name', 'diameter', 'climate', 'terrain', 'surface', 'water', 'population'];
  const prevButton = document.querySelector('#previous-button');
  const nextButton = document.querySelector('#next-button');
  let clickDebounce = null;

  registerButtonEvent();
  getUrl('https://swapi.py4e.com/api/planets/?format=json', insertData)


  ///////////////////////////////////////////////
  //               functions                   //
  ///////////////////////////////////////////////
  function registerButtonEvent() {
    [nextButton, prevButton].forEach(button => {
      button.addEventListener('click', () => {
        const planetsUrl = button.getAttribute('url');
        if (!clickDebounce) {
          getUrl(planetsUrl, insertData);
          clickDebounce = setTimeout(() => {
            clearTimeout(clickDebounce);
            clickDebounce = null;
          }, 1000);
        } 
      });
    });
  }

  function convertDiameter(diameter) {
    let lastThree = diameter % 1000;
    let stringValue = String(diameter);
    let thirstValues = stringValue.slice(0, (stringValue.length - 3));
    return thirstValues + ',' + lastThree + 'km';
  }

  function convertPopulation(population) {
    return population === 'unknown' ? 'unknown' : population + ' people';
  }

  function convertSurface(surface_water) {
    return surface_water === 'unknown' ? 'unknown' : surface_water + '%';
  }

  function insertData(data) {
    console.log(data);
    table.innerHTML = '';
    var dataHTML = '';

    if (data.previous) {
      prevButton.setAttribute('url', data.previous);
      prevButton.classList.remove('disabled');
    } else {
      prevButton.classList.add('disabled');
    }

    if (data.next) {
      nextButton.setAttribute('url', data.next);
      nextButton.classList.remove('disabled');
    } else {
      nextButton.classList.add('disabled');
    }

    data.results.forEach(row => {
      row.surface_water = convertSurface(row.surface_water);
      row.population = convertPopulation(row.population);
      row.diameter = convertDiameter(row.diameter);

      let residentsNumber = ''
      if (row.residents.length == 0) {
        residentsNumber = 'No known residents';
      } else {
        residentsNumber = `<button type="button" id="${row.name}" class="btn-residents btn btn-primary"\
          data-bs-toggle="modal" data-bs-target="#staticBackdrop">\
          ${row.residents.length} residents</button>`
      }

      dataHTML = '\
        <td>' + row.name + '</td>\
        <td>' + row.diameter + '</td>\
        <td>' + row.climate + '</td>\
        <td>' + row.terrain + '</td>\
        <td>' + row.surface_water + '</td>\
        <td>' + row.population + `</td>\
        <td>${residentsNumber}</td>\
        <td><button class="btn btn-primary">Vote</button></td>`;
      
      let trTable = document.createElement('tr');
      trTable.innerHTML = dataHTML;
      table.appendChild(trTable);
 
      let residentButton = document.getElementById(row.name);
      console.log(residentButton);
      if (residentButton != null) {
        residentButton.addEventListener('click', function() {
          getResidents(row.residents, row.name)});
      }
    });
  }

  function insertDataPeople(data) {
    let modalTable = document.querySelector('.modal-body>table>tbody');
    modalTable.innerHTML = '';
    data.forEach(row => {
      dataHTML = `\
      <td>${row.name}</td> \
      <td>${row.height}</td>
      <td>${row.mass}</td>
      <td>${row.hair_color}</td>
      <td>${row.skin_color}</td>
      <td>${row.eye_color}</td>
      <td>${row.birth_year}</td>
      <td>${row.gender}</td>`

      let trTable = document.createElement('tr');
      trTable.innerHTML = dataHTML;
      modalTable.appendChild(trTable);
    })
  }

  function insertPlanetName(planetName) {
    let modalTitle = document.querySelector('.modal-header>h1');
    modalTitle.innerHTML = `Residents of ${planetName}`;
  }


  function getResidents(residentsUrls, planetName) {
    let apiCall = getData(residentsUrls);
    apiCall.then(results => {
      console.log('all residents data in array: ', results);
      insertDataPeople(results);
      insertPlanetName(planetName);
    });
  }


  function insertPlanets(data) {
    console.log(data);
    dataHTML = '';

    if (data.previous) {
      prevButton.setAttribute('url', data.previous);
      prevButton.classList.remove('disabled');
    } else {
      prevButton.classList.add('disabled');
    };

    if (data.next) {
      nextButton.setAttribute('url', data.next);
      nextButton.classList.remove('disabled');
    } else {
      nextButton.classList.add('disabled');
    }

    const headerRow = document.createElement('tr');
    Object.keys(data.results[0]).forEach(key => {
      const th = document.createElement('th');
      th.innerHTML = key;
      headerRow.append(th);
    });
    table.previousElementSibling.append(headerRow);

    data.results.forEach(row => {
      const dataRow = document.createElement('tr');
      Object.entries(row).forEach(([key, value]) => {
        
        if (key === 'diameter') {
          value = convertDiameter(value);
        }

        if (key === 'surface_water') {
          value = convertSurface(value);
        }

        if (key === 'population') {
          value = convertPopulation(value);
        }
        
        
        const td = document.createElement('td');
        td.innerHTML = value;
        dataRow.append(td);
      });
      table.append(dataRow);
    });
  }

  function getData(dataArray) {
    let promiseAll = Promise.all(dataArray.map(u => apiRequest(u)));
    return promiseAll;
  }

  async function apiRequest(url) {
    const response = await fetch(url);
    let json = await response.json();
    return json;
  }

  function getUrl(url, callback) {
    fetch(url)
      .then(response => {
        return response.json();
      }).then(results => {
        callback(results);
      });
  }
};