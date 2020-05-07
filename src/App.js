import React from 'react';
import './App.css';
const clientId = 'o9ai1orr9lfs2r17tnwgz4hm6i5j6z';
const clientSecret =  process.env.REACT_APP_TCS;
var accessToken;

async function postToken() {
  const url = 'https://id.twitch.tv/oauth2/token'
    + '?client_id=' + clientId
    + '&client_secret=' + clientSecret
    + '&grant_type=client_credentials';
  const r = await fetch(url, {
    method: 'POST'
  });
  return r.json();
}

async function getUserByName(name) {
  const r = await fetch('https://api.twitch.tv/helix/users?login=' + name, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Authorization': 'Bearer ' + accessToken
    }
  });
  return r.json();
}

async function getFollowingById(user_id, after) {
  const r = await fetch('https://api.twitch.tv/helix/users/follows?from_id=' + user_id + (after ? '&after=' + after : ''), {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Authorization': 'Bearer ' + accessToken
    }
  })
  return r.json();
}

async function getUserById(user_id) {
  const r = await fetch('https://api.twitch.tv/kraken/users/' + user_id, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  return r.json();
}

function populateFollows(r, userId, userName, cursor) {
  getFollowingById(userId, cursor).then(async r => {
    if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
      return;
    }
    const es = r.data.sort(function (a, b) {
      return new Date(b.followed_at) - new Date(a.followed_at);
    });
    for (var i = 0; i < es.length; i++) {
      const e = es[i];
      const fDate = new Date(e.followed_at);
      if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
        return;
      }
      const resp = await getUserById(e.to_id);
      if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
        return;
      }
      const elem = document.getElementById('cont');
      var line = '<div>'
      line += '<a href="https://www.twitch.tv/' + resp.name + '" target="_blank">' + resp.display_name + '</a>';
      line += '\t(' + fDate.getFullYear() + '/' + (fDate.getMonth() + 1) + '/' + fDate.getDate() + ')';
      line += '</div>';
      elem.innerHTML += line;
    }
    if (es.length > 0 && r.pagination && r.pagination.cursor) {
      populateFollows(r, userId, userName, r.pagination.cursor)
    }
  });
}

function populatePage(r) {
  if (r.data[0].profile_image_url) {
    const elem = document.getElementById('title');
    elem.innerHTML += '<img src="' + r.data[0].profile_image_url + '" />'
  }
  const userName = r.data[0].login;
  const userId = r.data[0].id;
  populateFollows(r, userId, userName);
}

async function startFind() {
  document.getElementById('title').innerHTML = '';
  document.getElementById('cont').innerHTML = '';

  const name = document.getElementById('name').value;
  document.currentName = name;
  const d = await getUserByName(name);
  if (d && d.data && d.data.length > 0) {
    populatePage(d)
  } else {
    document.getElementById('title').innerHTML = '<div>체크 아이디 플리즈</div>';
  }
}



function App() {
  document.currentName = 'heehee1004';
  postToken().then(r => {
      accessToken = r.access_token;
      getUserByName('heehee1004').then(populatePage);
  });

  return (
    <div className="App">
      아이디: <input type="text" id="name" placeholder="heehee1004" />
      <input id="findButton" type="button" value="ㄱㄱ" onclick="startFind();" />
      <h1 id='title'></h1>
      <h4 id='cont'></h4>
    </div>
  );
}

export default App;
