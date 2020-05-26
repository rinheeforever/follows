import React from 'react';
import './App.css';
const clientId = 'o9ai1orr9lfs2r17tnwgz4hm6i5j6z';
const pageSize = 100;

const getUserByName = async function (name) {
  const r = await fetch('https://api.twitch.tv/kraken/users?login=' + name, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  });
  return r.json();
}

const getFollowingById = async function (user_id) {
  const r = await fetch('https://api.twitch.tv/kraken/users/' + user_id + '/follows/channels?limit=' + pageSize + '&offset=' + document.offset, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  })
  return r.json();
}

const populateFollows = function (r, userId, userName) {
  getFollowingById(userId).then(r => {
    const elem = document.getElementById('table');
    for (var i = 0; i < r.follows.length; i++) {
      const e = r.follows[i];
      const fDate = new Date(e.created_at);
      const resp = r.follows[i].channel;

      var row = document.createElement('tr');;
      var col;

      var nameElem = document.createElement('a');
      var nameText = document.createTextNode(resp.display_name); 
      nameElem.appendChild(nameText);
      nameElem.setAttribute('href', `https://www.twitch.tv/${resp.name}`);
      nameElem.setAttribute('target', `_blank`);
      col = document.createElement('td');
      col.appendChild(nameElem);
      row.appendChild(col);

      var followLink = document.createElement("input");
      followLink.type = "button";
      followLink.value = resp.name;
      followLink.name = resp.name;
      followLink.addEventListener('click', async function() {
        document.getElementById('name').value = resp.name;
        startFind()
      });
      col = document.createElement('td');
      col.appendChild(followLink);
      row.appendChild(col);

      var dateFollowed = document.createTextNode(`(${fDate.getFullYear()}/${(fDate.getMonth() + 1)}/${fDate.getDate()})`);
      col = document.createElement('td');
      col.appendChild(dateFollowed);
      row.appendChild(col);

      elem.appendChild(row);
    }

    if (elem.childElementCount < r._total) {
      document.offset = elem.childElementCount;
      populateFollows(r, userId, userName)
    }
  });
}

const getTopClipId = async function(channel) {
  const r = await fetch('https://api.twitch.tv/kraken/clips/top?channel=' + channel + '&period=all&limit=1', {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Accept': 'application/vnd.twitchtv.v5+json'
    }
  })
  return r.json();
}

const populatePage = function (r) {
  const elem = document.getElementById('title');
  if (r.users[0].logo) {
    var image = document.createElement('a');
    const imageSrc = document.createElement('img');
    imageSrc.setAttribute('src', r.users[0].logo);
    image.appendChild(imageSrc);
    image.setAttribute('href', `https://www.twitch.tv/${r.users[0].name}`);
    image.setAttribute('target', `_blank`);
    elem.appendChild(image);
  }
  const userName = r.users[0].display_name;
  const userId = r.users[0]._id;
  
  getTopClipId(r.users[0].name).then(r => {
    const player = `<iframe
      src="${r.clips[0].embed_url}&autoplay=false"
      height="288"
      width="512"
      style="padding:10px;"
      frameborder="0"
      scrolling="no"
      allowfullscreen="true">
    </iframe>`;
    elem.innerHTML += player;
  });

  populateFollows(r, userId, userName);
}

const startFind = async function () {
  document.getElementById('title').innerHTML = '';
  document.getElementById('table').innerHTML = '';

  const name = document.getElementById('name').value;
  document.offset = 0;
  const d = await getUserByName(name);
  if (d && d.users && d.users.length > 0) {
    populatePage(d)
  } else {
    document.getElementById('title').innerHTML = '<div>체크 아이디 플리즈</div>';
  }
}

class App extends React.Component {
  componentDidMount() {
    document.offset = 0;
    getUserByName('heehee1004').then(populatePage);

    document.getElementById("name").addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        startFind();
      }
    });

    document.getElementById('findButton').addEventListener('click', function() {
      startFind();
    })
  }
  
  render() {
    
    return (
      <div className="App" class="container">
        <div class="input">
          아이디: <input type="text" id="name" placeholder="heehee1004"  />
          <input id="findButton" type="button" value="고고" />
        </div>
        <div id='title' class="title" />
        <table id='table' />
      </div>
    );
  }
}
export default App;
