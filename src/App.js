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
    const elem = document.getElementById('cont');
    for (var i = 0; i < r.follows.length; i++) {
      const e = r.follows[i];
      const fDate = new Date(e.created_at);
      const resp = r.follows[i].channel;
      var line = '<div>'
      line += '<a href="https://www.twitch.tv/' + resp.name + '" target="_blank">' + resp.display_name + '</a>';
      line += '\t(' + fDate.getFullYear() + '/' + (fDate.getMonth() + 1) + '/' + fDate.getDate() + ')';
      line += '</div>';
      elem.innerHTML += line;
    }
    if (r.follows.length > 0) {
      document.offset += pageSize;
      populateFollows(r, userId, userName)
    }
  });
}

const populatePage = function (r) {
  if (r.users[0].logo) {
    const elem = document.getElementById('title');
    elem.innerHTML += '<img src="' + r.users[0].logo + '" />'
  }
  const userName = r.users[0].display_name;
  const userId = r.users[0]._id;
  populateFollows(r, userId, userName);
}

const startFind = async function () {
  document.getElementById('title').innerHTML = '';
  document.getElementById('cont').innerHTML = '';

  const name = document.getElementById('name').value;
  document.offset = 0;
  document.currentName = name;
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
    document.currentName = 'heehee1004';
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
        <div id='cont' />
      </div>
    );
  }
}
export default App;
